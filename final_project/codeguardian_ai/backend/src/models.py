from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    repository_url = Column(String(500))
    project_type = Column(String(50))  # api, web_app, microservice, etc.
    language = Column(String(50))  # python, javascript, typescript, etc.
    framework = Column(String(100))  # fastapi, react, express, etc.
    status = Column(String(50), default="active")  # active, archived, analyzing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    analyses = relationship("Analysis", back_populates="project")
    security_scans = relationship("SecurityScan", back_populates="project")


class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String(50), nullable=False)  # security, quality, testing, performance
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    progress = Column(Float, default=0.0)  # 0.0 to 100.0
    results = Column(JSON)  # Store analysis results as JSON
    analysis_metadata = Column(JSON)  # Additional metadata
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="analyses")


class SecurityScan(Base):
    __tablename__ = "security_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String(50), nullable=False)  # secrets, vulnerabilities, dependencies
    tool_name = Column(String(100))  # bandit, safety, semgrep, etc.
    status = Column(String(50), default="pending")
    findings_count = Column(Integer, default=0)
    high_severity_count = Column(Integer, default=0)
    medium_severity_count = Column(Integer, default=0)
    low_severity_count = Column(Integer, default=0)
    findings = Column(JSON)  # Detailed findings
    scan_duration = Column(Float)  # Duration in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="security_scans")


class CodeQualityReport(Base):
    __tablename__ = "code_quality_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    maintainability_index = Column(Float)
    complexity_score = Column(Float)
    duplication_percentage = Column(Float)
    test_coverage_percentage = Column(Float)
    lines_of_code = Column(Integer)
    technical_debt_minutes = Column(Integer)
    code_smells_count = Column(Integer)
    bug_count = Column(Integer)
    vulnerability_count = Column(Integer)
    quality_gate_status = Column(String(50))  # passed, failed, warning
    detailed_metrics = Column(JSON)
    ai_suggestions = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Relationships
    project = relationship("Project")


class TestGenerationResult(Base):
    __tablename__ = "test_generation_results"
    
    id = Column(Integer, primary_key=True, index=True)
    test_type = Column(String(50))  # unit, integration, api, performance
    framework = Column(String(50))  # pytest, jest, cypress, etc.
    generated_tests_count = Column(Integer, default=0)
    coverage_improvement = Column(Float)  # Percentage improvement
    test_files_created = Column(JSON)  # List of created test files
    ai_confidence_score = Column(Float)  # 0.0 to 1.0
    generation_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Relationships
    project = relationship("Project")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_type = Column(String(50))  # security_fix, refactoring, optimization, testing
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(500))
    line_number = Column(Integer)
    severity = Column(String(20))  # low, medium, high, critical
    confidence_score = Column(Float)  # 0.0 to 1.0
    suggested_fix = Column(Text)
    code_snippet = Column(Text)
    fixed_code_snippet = Column(Text)
    status = Column(String(50), default="open")  # open, accepted, rejected, implemented
    ai_model_used = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Relationships
    project = relationship("Project")
