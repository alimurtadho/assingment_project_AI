from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
import logging
import asyncio

from ..database import get_database
from ..models import User, Project, Analysis, CodeQualityReport
from ..auth import get_current_user
from ..config import settings
from ..services.ai_analysis import AIAnalysisService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize AI Analysis Service
ai_service = AIAnalysisService()


# Pydantic models
class AnalysisRequest(BaseModel):
    analysis_types: List[str] = ["quality", "testing", "performance"]


class AnalysisResponse(BaseModel):
    id: int
    analysis_type: str
    status: str
    progress: float
    results: Optional[Dict[str, Any]]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True


class CodeQualityMetrics(BaseModel):
    maintainability_index: Optional[float]
    complexity_score: Optional[float]
    duplication_percentage: Optional[float]
    test_coverage_percentage: Optional[float]
    lines_of_code: Optional[int]
    technical_debt_minutes: Optional[int]
    code_smells_count: Optional[int]
    bug_count: Optional[int]
    vulnerability_count: Optional[int]
    quality_gate_status: Optional[str]


def analyze_code_quality(project_path: str) -> Dict[str, Any]:
    """Analyze code quality metrics"""
    try:
        metrics = {}
        
        # Count lines of code
        total_lines = 0
        python_files = 0
        js_files = 0
        
        for root, dirs, files in os.walk(project_path):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.pytest_cache']]
            
            for file in files:
                if file.endswith('.py'):
                    python_files += 1
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            total_lines += len(f.readlines())
                    except:
                        pass
                elif file.endswith(('.js', '.ts', '.jsx', '.tsx')):
                    js_files += 1
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            total_lines += len(f.readlines())
                    except:
                        pass
        
        metrics['lines_of_code'] = total_lines
        metrics['python_files'] = python_files
        metrics['javascript_files'] = js_files
        
        # Simple complexity analysis (placeholder)
        # In a real implementation, you'd use tools like radon for Python or ESLint for JS
        if total_lines > 0:
            metrics['maintainability_index'] = max(0, 100 - (total_lines / 100))
            metrics['complexity_score'] = min(100, total_lines / 50)
            metrics['duplication_percentage'] = 5.0  # Placeholder
            metrics['technical_debt_minutes'] = int(total_lines / 20)
            metrics['code_smells_count'] = int(total_lines / 100)
        else:
            metrics['maintainability_index'] = 100
            metrics['complexity_score'] = 0
            metrics['duplication_percentage'] = 0
            metrics['technical_debt_minutes'] = 0
            metrics['code_smells_count'] = 0
        
        # Quality gate status
        if metrics['maintainability_index'] > 80:
            metrics['quality_gate_status'] = 'passed'
        elif metrics['maintainability_index'] > 60:
            metrics['quality_gate_status'] = 'warning'
        else:
            metrics['quality_gate_status'] = 'failed'
        
        return metrics
    
    except Exception as e:
        logger.error(f"Code quality analysis failed: {e}")
        return {"error": str(e)}


def analyze_test_coverage(project_path: str) -> Dict[str, Any]:
    """Analyze test coverage"""
    try:
        metrics = {}
        
        # Count test files
        test_files = 0
        source_files = 0
        
        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
            
            for file in files:
                if file.startswith('test_') or file.endswith('_test.py') or 'test' in file:
                    test_files += 1
                elif file.endswith(('.py', '.js', '.ts')):
                    source_files += 1
        
        if source_files > 0:
            estimated_coverage = min(100, (test_files / source_files) * 100)
        else:
            estimated_coverage = 0
        
        metrics['test_files_count'] = test_files
        metrics['source_files_count'] = source_files
        metrics['estimated_coverage'] = estimated_coverage
        
        return metrics
    
    except Exception as e:
        logger.error(f"Test coverage analysis failed: {e}")
        return {"error": str(e)}


def analyze_performance(project_path: str) -> Dict[str, Any]:
    """Analyze performance patterns"""
    try:
        metrics = {}
        
        # Look for common performance issues (placeholder)
        performance_issues = []
        
        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
            
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                            # Simple performance pattern detection
                            if 'for' in content and 'range' in content:
                                performance_issues.append({
                                    'file': file,
                                    'issue': 'Potential inefficient loop',
                                    'severity': 'medium'
                                })
                            
                            if 'SELECT *' in content.upper():
                                performance_issues.append({
                                    'file': file,
                                    'issue': 'SELECT * query detected',
                                    'severity': 'high'
                                })
                    except:
                        pass
        
        metrics['performance_issues'] = performance_issues
        metrics['issues_count'] = len(performance_issues)
        
        return metrics
    
    except Exception as e:
        logger.error(f"Performance analysis failed: {e}")
        return {"error": str(e)}


async def perform_analysis(
    project_id: int,
    analysis_request: AnalysisRequest,
    db: Session
):
    """Perform code analysis in background"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return
    
    project_path = os.path.join(settings.upload_dir, f"project_{project_id}", "extracted")
    
    if not os.path.exists(project_path):
        logger.error(f"Project path not found: {project_path}")
        return
    
    # Perform requested analyses
    for analysis_type in analysis_request.analysis_types:
        logger.info(f"Running {analysis_type} analysis for project {project_id}")
        
        analysis = Analysis(
            project_id=project_id,
            analysis_type=analysis_type,
            status="running",
            progress=0.0
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        try:
            results = {}
            
            if analysis_type == "quality":
                analysis.progress = 25.0
                db.commit()
                
                quality_metrics = analyze_code_quality(project_path)
                results.update(quality_metrics)
                
                # Create quality report
                if 'error' not in quality_metrics:
                    quality_report = CodeQualityReport(
                        project_id=project_id,
                        maintainability_index=quality_metrics.get('maintainability_index'),
                        complexity_score=quality_metrics.get('complexity_score'),
                        duplication_percentage=quality_metrics.get('duplication_percentage'),
                        lines_of_code=quality_metrics.get('lines_of_code'),
                        technical_debt_minutes=quality_metrics.get('technical_debt_minutes'),
                        code_smells_count=quality_metrics.get('code_smells_count'),
                        quality_gate_status=quality_metrics.get('quality_gate_status'),
                        detailed_metrics=quality_metrics
                    )
                    db.add(quality_report)
                
                analysis.progress = 50.0
                db.commit()
            
            elif analysis_type == "testing":
                analysis.progress = 25.0
                db.commit()
                
                test_metrics = analyze_test_coverage(project_path)
                results.update(test_metrics)
                
                analysis.progress = 50.0
                db.commit()
            
            elif analysis_type == "performance":
                analysis.progress = 25.0
                db.commit()
                
                perf_metrics = analyze_performance(project_path)
                results.update(perf_metrics)
                
                analysis.progress = 50.0
                db.commit()
            
            # Complete analysis
            analysis.status = "completed"
            analysis.progress = 100.0
            analysis.results = results
            
        except Exception as e:
            logger.error(f"{analysis_type} analysis failed: {e}")
            analysis.status = "failed"
            analysis.error_message = str(e)
        
        db.commit()


@router.post("/{project_id}/analyze")
async def start_analysis(
    project_id: int,
    analysis_request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Start code analysis for a project"""
    
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
        perform_analysis,
        project_id,
        analysis_request,
        db
    )
    
    return {
        "message": "Analysis started",
        "project_id": project_id,
        "analysis_types": analysis_request.analysis_types
    }


@router.get("/{project_id}/analyses", response_model=List[AnalysisResponse])
async def get_analyses(
    project_id: int,
    analysis_type: Optional[str] = None,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get analyses for a project"""
    
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
    
    query = db.query(Analysis).filter(Analysis.project_id == project_id)
    
    if analysis_type:
        query = query.filter(Analysis.analysis_type == analysis_type)
    
    analyses = query.order_by(Analysis.started_at.desc()).all()
    
    return analyses


@router.get("/{project_id}/quality-report")
async def get_quality_report(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get latest code quality report for a project"""
    
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
    
    quality_report = db.query(CodeQualityReport).filter(
        CodeQualityReport.project_id == project_id
    ).order_by(CodeQualityReport.created_at.desc()).first()
    
    if not quality_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No quality report found"
        )
    
    return {
        "project_id": project_id,
        "maintainability_index": quality_report.maintainability_index,
        "complexity_score": quality_report.complexity_score,
        "duplication_percentage": quality_report.duplication_percentage,
        "test_coverage_percentage": quality_report.test_coverage_percentage,
        "lines_of_code": quality_report.lines_of_code,
        "technical_debt_minutes": quality_report.technical_debt_minutes,
        "code_smells_count": quality_report.code_smells_count,
        "bug_count": quality_report.bug_count,
        "vulnerability_count": quality_report.vulnerability_count,
        "quality_gate_status": quality_report.quality_gate_status,
        "generated_at": quality_report.created_at
    }


# New AI-Enhanced Analysis Endpoints

@router.post("/{project_id}/ai-code-analysis")
async def ai_code_analysis(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Perform AI-powered comprehensive code analysis using advanced prompt engineering.
    Implements deep analyst on prompt iteration and complex function generation.
    """
    
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
    
    try:
        # Get project files for analysis
        project_path = os.path.join(settings.upload_dir, f"project_{project_id}")
        if not os.path.exists(project_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project files not found"
            )
        
        # Collect code files for AI analysis
        code_content = ""
        file_count = 0
        
        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
            
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.java', '.cpp', '.c')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            code_content += f"\n\n=== {file} ===\n{content}"
                            file_count += 1
                            
                            # Limit analysis to prevent token overflow
                            if len(code_content) > 15000:  # Reasonable limit for GPT-4
                                break
                    except Exception as e:
                        logger.warning(f"Could not read file {file}: {e}")
                        continue
                
                if len(code_content) > 15000:
                    break
        
        if not code_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No analyzable code files found"
            )
        
        # Prepare analysis context
        analysis_context = {
            "project_type": project.technology_stack or "web_application",
            "team_size": "5-10 developers",
            "performance_requirements": "medium to high"
        }
        
        # Perform AI-powered code quality analysis
        logger.info(f"Starting AI code analysis for project {project_id}")
        ai_analysis = await ai_service.analyze_code_quality(
            code=code_content,
            language="python",  # Can be enhanced to detect automatically
            project_type=analysis_context["project_type"],
            context=analysis_context
        )
        
        # Validate and fix AI output (course requirement)
        validated_analysis = await ai_service.validate_and_fix_ai_output(
            ai_analysis=ai_analysis,
            original_code=code_content,
            analysis_type="code_quality"
        )
        
        # Store AI analysis in database
        analysis_record = Analysis(
            project_id=project_id,
            analysis_type="ai_code_quality",
            status="completed",
            progress=100.0,
            results={
                "ai_analysis": validated_analysis,
                "files_analyzed": file_count,
                "total_lines": len(code_content.split('\n')),
                "analysis_scope": "comprehensive_ai_review"
            }
        )
        
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        
        return {
            "analysis_id": analysis_record.id,
            "status": "completed",
            "ai_analysis": validated_analysis,
            "metadata": {
                "files_analyzed": file_count,
                "analysis_type": "ai_code_quality",
                "prompt_engineering_version": "v1.0",
                "model_used": validated_analysis.get("ai_analysis_metadata", {}).get("model_used", "gpt-4")
            }
        }
        
    except Exception as e:
        logger.error(f"AI code analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.post("/{project_id}/ai-security-analysis")
async def ai_security_analysis(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Perform AI-enhanced security vulnerability analysis with intelligent false positive filtering.
    Uses advanced prompt engineering for context-aware security recommendations.
    """
    
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
    
    try:
        # Get project files for security analysis
        project_path = os.path.join(settings.upload_dir, f"project_{project_id}")
        code_content = ""
        
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.endswith(('.py', '.js', '.ts')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            code_content += f"\n\n=== {file} ===\n{content}"
                            
                            if len(code_content) > 12000:  # Limit for security analysis
                                break
                    except:
                        continue
                
                if len(code_content) > 12000:
                    break
        
        # Get existing static analysis results for context
        static_findings = []
        # You could integrate with existing security scanners here
        
        # Prepare security context
        security_context = {
            "app_type": "web_application",
            "data_sensitivity": "medium",
            "integrations": "database, external_apis",
            "compliance": "basic"
        }
        
        # Perform AI security analysis
        logger.info(f"Starting AI security analysis for project {project_id}")
        ai_security = await ai_service.analyze_security_vulnerabilities(
            code=code_content,
            static_findings=static_findings,
            context=security_context
        )
        
        # Validate AI security output
        validated_security = await ai_service.validate_and_fix_ai_output(
            ai_analysis=ai_security,
            original_code=code_content,
            analysis_type="security"
        )
        
        # Store results
        analysis_record = Analysis(
            project_id=project_id,
            analysis_type="ai_security",
            status="completed",
            progress=100.0,
            results={
                "ai_security_analysis": validated_security,
                "static_findings_processed": len(static_findings),
                "analysis_scope": "comprehensive_security_review"
            }
        )
        
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        
        return {
            "analysis_id": analysis_record.id,
            "status": "completed",
            "security_analysis": validated_security,
            "metadata": {
                "analysis_type": "ai_security",
                "false_positive_filtering": "enabled",
                "context_awareness": "high"
            }
        }
        
    except Exception as e:
        logger.error(f"AI security analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI security analysis failed: {str(e)}"
        )


@router.post("/{project_id}/ai-refactoring-suggestions")
async def ai_refactoring_suggestions(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered refactoring suggestions to assist with bad code improvement.
    Implements advanced prompt engineering for intelligent code improvement recommendations.
    """
    
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
    
    try:
        # Get current quality metrics
        latest_quality_report = db.query(CodeQualityReport).filter(
            CodeQualityReport.project_id == project_id
        ).order_by(CodeQualityReport.created_at.desc()).first()
        
        current_metrics = {}
        if latest_quality_report:
            current_metrics = {
                "complexity_score": latest_quality_report.complexity_score,
                "maintainability_index": latest_quality_report.maintainability_index,
                "test_coverage": latest_quality_report.test_coverage_percentage,
                "code_smells": latest_quality_report.code_smells_count
            }
        
        # Get code for refactoring analysis
        project_path = os.path.join(settings.upload_dir, f"project_{project_id}")
        code_content = ""
        
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.endswith(('.py', '.js', '.ts')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            code_content += f"\n\n=== {file} ===\n{content}"
                            
                            if len(code_content) > 10000:
                                break
                    except:
                        continue
                
                if len(code_content) > 10000:
                    break
        
        # Perform AI refactoring analysis
        logger.info(f"Starting AI refactoring analysis for project {project_id}")
        ai_refactoring = await ai_service.generate_refactoring_suggestions(
            code=code_content,
            current_metrics=current_metrics,
            context={"priority": "maintainability"}
        )
        
        # Validate refactoring suggestions
        validated_refactoring = await ai_service.validate_and_fix_ai_output(
            ai_analysis=ai_refactoring,
            original_code=code_content,
            analysis_type="refactoring"
        )
        
        # Store results
        analysis_record = Analysis(
            project_id=project_id,
            analysis_type="ai_refactoring",
            status="completed",
            progress=100.0,
            results={
                "ai_refactoring_suggestions": validated_refactoring,
                "current_metrics": current_metrics,
                "analysis_scope": "code_improvement_recommendations"
            }
        )
        
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)
        
        return {
            "analysis_id": analysis_record.id,
            "status": "completed",
            "refactoring_suggestions": validated_refactoring,
            "metadata": {
                "analysis_type": "ai_refactoring",
                "bad_code_assistance": "enabled",
                "improvement_focus": "maintainability_and_performance"
            }
        }
        
    except Exception as e:
        logger.error(f"AI refactoring analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI refactoring analysis failed: {str(e)}"
        )


@router.get("/{project_id}/ai-service-status")
async def get_ai_service_status(
    project_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI analysis service status and capabilities.
    Shows advanced prompt engineering features and available analysis types.
    """
    
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
    
    service_status = ai_service.get_service_status()
    
    # Add project-specific AI analysis history
    ai_analyses = db.query(Analysis).filter(
        Analysis.project_id == project_id,
        Analysis.analysis_type.in_(["ai_code_quality", "ai_security", "ai_refactoring"])
    ).order_by(Analysis.started_at.desc()).limit(5).all()
    
    analysis_history = []
    for analysis in ai_analyses:
        analysis_history.append({
            "id": analysis.id,
            "type": analysis.analysis_type,
            "status": analysis.status,
            "started_at": analysis.started_at,
            "completed_at": analysis.completed_at
        })
    
    return {
        "project_id": project_id,
        "ai_service_status": service_status,
        "recent_ai_analyses": analysis_history,
        "advanced_features": {
            "prompt_engineering": "v1.0 - Advanced multi-dimensional analysis",
            "output_validation": "Enabled - Validates and fixes AI responses",
            "context_awareness": "High - Project-specific intelligent analysis",
            "false_positive_filtering": "AI-powered intelligent filtering"
        }
    }
