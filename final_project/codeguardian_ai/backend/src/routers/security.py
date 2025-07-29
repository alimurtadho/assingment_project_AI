from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import subprocess
import json
import os
import tempfile
import logging

from ..database import get_database
from ..models import User, Project, SecurityScan, Analysis
from ..auth import get_current_user
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic models
class SecurityScanRequest(BaseModel):
    scan_types: List[str] = ["secrets", "vulnerabilities", "dependencies"]
    tools: List[str] = ["bandit", "safety"]


class SecurityFinding(BaseModel):
    file_path: str
    line_number: int
    severity: str
    category: str
    message: str
    rule_id: Optional[str] = None
    cwe_id: Optional[str] = None


class SecurityScanResponse(BaseModel):
    id: int
    scan_type: str
    tool_name: str
    status: str
    findings_count: int
    high_severity_count: int
    medium_severity_count: int
    low_severity_count: int
    scan_duration: Optional[float]
    
    class Config:
        from_attributes = True


def run_bandit_scan(project_path: str) -> Dict[str, Any]:
    """Run Bandit security scan"""
    try:
        cmd = [
            "bandit", 
            "-r", project_path,
            "-f", "json",
            "-o", "/tmp/bandit_report.json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        # Read the JSON report
        if os.path.exists("/tmp/bandit_report.json"):
            with open("/tmp/bandit_report.json", "r") as f:
                report = json.load(f)
            os.remove("/tmp/bandit_report.json")
            return report
        
        return {"results": [], "metrics": {}}
    
    except subprocess.TimeoutExpired:
        logger.error("Bandit scan timed out")
        return {"error": "Scan timed out"}
    except Exception as e:
        logger.error(f"Bandit scan failed: {e}")
        return {"error": str(e)}


def run_safety_scan(project_path: str) -> Dict[str, Any]:
    """Run Safety dependency scan"""
    try:
        # Look for requirements.txt
        requirements_file = os.path.join(project_path, "requirements.txt")
        if not os.path.exists(requirements_file):
            return {"results": [], "message": "No requirements.txt found"}
        
        cmd = [
            "safety", "check",
            "-r", requirements_file,
            "--json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.stdout:
            return json.loads(result.stdout)
        
        return {"results": []}
    
    except subprocess.TimeoutExpired:
        logger.error("Safety scan timed out")
        return {"error": "Scan timed out"}
    except Exception as e:
        logger.error(f"Safety scan failed: {e}")
        return {"error": str(e)}


def parse_bandit_results(bandit_report: Dict[str, Any]) -> List[SecurityFinding]:
    """Parse Bandit scan results"""
    findings = []
    
    for result in bandit_report.get("results", []):
        finding = SecurityFinding(
            file_path=result.get("filename", ""),
            line_number=result.get("line_number", 0),
            severity=result.get("issue_severity", "UNKNOWN").lower(),
            category=result.get("test_name", ""),
            message=result.get("issue_text", ""),
            rule_id=result.get("test_id", ""),
            cwe_id=result.get("issue_cwe", {}).get("id") if result.get("issue_cwe") else None
        )
        findings.append(finding)
    
    return findings


def parse_safety_results(safety_report: Dict[str, Any]) -> List[SecurityFinding]:
    """Parse Safety scan results"""
    findings = []
    
    for result in safety_report.get("results", []):
        finding = SecurityFinding(
            file_path="requirements.txt",
            line_number=0,
            severity="high",  # All dependency vulnerabilities are high severity
            category="dependency_vulnerability",
            message=f"Vulnerable package: {result.get('package', 'Unknown')} - {result.get('advisory', '')}",
            rule_id=result.get("id", ""),
            cwe_id=None
        )
        findings.append(finding)
    
    return findings


async def perform_security_scan(
    project_id: int,
    scan_request: SecurityScanRequest,
    db: Session
):
    """Perform security scan in background"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return
    
    project_path = os.path.join(settings.upload_dir, f"project_{project_id}", "extracted")
    
    if not os.path.exists(project_path):
        logger.error(f"Project path not found: {project_path}")
        return
    
    # Run requested scans
    if "bandit" in scan_request.tools and settings.enable_bandit:
        logger.info(f"Running Bandit scan for project {project_id}")
        
        scan = SecurityScan(
            project_id=project_id,
            scan_type="vulnerabilities",
            tool_name="bandit",
            status="running"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        try:
            bandit_report = run_bandit_scan(project_path)
            findings = parse_bandit_results(bandit_report)
            
            # Count severities
            high_count = sum(1 for f in findings if f.severity == "high")
            medium_count = sum(1 for f in findings if f.severity == "medium")
            low_count = sum(1 for f in findings if f.severity == "low")
            
            # Update scan results
            scan.status = "completed"
            scan.findings_count = len(findings)
            scan.high_severity_count = high_count
            scan.medium_severity_count = medium_count
            scan.low_severity_count = low_count
            scan.findings = [f.dict() for f in findings]
            
        except Exception as e:
            logger.error(f"Bandit scan failed: {e}")
            scan.status = "failed"
        
        db.commit()
    
    if "safety" in scan_request.tools and settings.enable_safety:
        logger.info(f"Running Safety scan for project {project_id}")
        
        scan = SecurityScan(
            project_id=project_id,
            scan_type="dependencies",
            tool_name="safety",
            status="running"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        try:
            safety_report = run_safety_scan(project_path)
            findings = parse_safety_results(safety_report)
            
            # Update scan results
            scan.status = "completed"
            scan.findings_count = len(findings)
            scan.high_severity_count = len(findings)  # All dependency issues are high
            scan.medium_severity_count = 0
            scan.low_severity_count = 0
            scan.findings = [f.dict() for f in findings]
            
        except Exception as e:
            logger.error(f"Safety scan failed: {e}")
            scan.status = "failed"
        
        db.commit()


@router.post("/{project_id}/scan")
async def start_security_scan(
    project_id: int,
    scan_request: SecurityScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Start security scan for a project"""
    
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Add background task
    background_tasks.add_task(
        perform_security_scan,
        project_id,
        scan_request,
        db
    )
    
    return {
        "message": "Security scan started",
        "project_id": project_id,
        "scan_types": scan_request.scan_types,
        "tools": scan_request.tools
    }


@router.get("/{project_id}/scans", response_model=List[SecurityScanResponse])
async def get_security_scans(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get security scans for a project"""
    
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    scans = db.query(SecurityScan).filter(
        SecurityScan.project_id == project_id
    ).order_by(SecurityScan.created_at.desc()).all()
    
    return scans


@router.get("/{project_id}/scans/{scan_id}/findings")
async def get_scan_findings(
    project_id: int,
    scan_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get detailed findings for a security scan"""
    
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    scan = db.query(SecurityScan).filter(
        SecurityScan.id == scan_id,
        SecurityScan.project_id == project_id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security scan not found"
        )
    
    return {
        "scan_id": scan_id,
        "scan_type": scan.scan_type,
        "tool_name": scan.tool_name,
        "status": scan.status,
        "findings_count": scan.findings_count,
        "findings": scan.findings or []
    }
