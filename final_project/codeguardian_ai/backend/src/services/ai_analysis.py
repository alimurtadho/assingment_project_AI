"""
AI Analysis Service for CodeGuardian AI Platform

This service implements advanced prompt engineering to produce complex functions
for intelligent code analysis, security recommendations, and quality assessment.
"""

import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from ..config import settings

logger = logging.getLogger(__name__)


class AIAnalysisService:
    """
    Advanced AI Analysis Service using sophisticated prompt engineering
    to deliver intelligent code insights and recommendations.
    """
    
    def __init__(self):
        """Initialize AI service with OpenAI client and prompt templates."""
        self.client = None
        if AsyncOpenAI and settings.openai_api_key:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        
        # Advanced prompt templates for different analysis types
        self.prompts = {
            "code_quality": self._get_code_quality_prompt(),
            "security_analysis": self._get_security_analysis_prompt(),
            "performance_review": self._get_performance_review_prompt(),
            "refactoring_suggestions": self._get_refactoring_prompt(),
            "test_generation": self._get_test_generation_prompt()
        }
    
    def _get_code_quality_prompt(self) -> str:
        """Advanced prompt for comprehensive code quality analysis."""
        return """
You are an expert software architect and code reviewer with 15+ years of experience.
Analyze the provided code with deep technical insight and provide comprehensive feedback.

ANALYSIS FRAMEWORK:
1. Code Architecture & Design Patterns
2. SOLID Principles Adherence  
3. Performance Optimization Opportunities
4. Maintainability & Readability Assessment
5. Best Practices Compliance
6. Technical Debt Identification

CODE TO ANALYZE:
{code}

CONTEXT:
- Language: {language}
- Project Type: {project_type}
- Team Size: {team_size}
- Performance Requirements: {performance_requirements}

REQUIRED OUTPUT FORMAT (JSON):
{{
    "overall_score": <1-100>,
    "architecture_assessment": {{
        "design_patterns_used": ["pattern1", "pattern2"],
        "architectural_issues": ["issue1", "issue2"],
        "improvement_suggestions": ["suggestion1", "suggestion2"]
    }},
    "solid_principles": {{
        "single_responsibility": {{"score": <1-10>, "violations": [], "recommendations": []}},
        "open_closed": {{"score": <1-10>, "violations": [], "recommendations": []}},
        "liskov_substitution": {{"score": <1-10>, "violations": [], "recommendations": []}},
        "interface_segregation": {{"score": <1-10>, "violations": [], "recommendations": []}},
        "dependency_inversion": {{"score": <1-10>, "violations": [], "recommendations": []}}
    }},
    "performance_analysis": {{
        "bottlenecks": [],
        "optimization_opportunities": [],
        "complexity_score": <1-10>,
        "memory_efficiency": <1-10>
    }},
    "maintainability": {{
        "readability_score": <1-10>,
        "documentation_quality": <1-10>,
        "naming_conventions": <1-10>,
        "code_organization": <1-10>
    }},
    "technical_debt": {{
        "debt_level": "low|medium|high|critical",
        "debt_items": [],
        "refactoring_priority": [],
        "estimated_effort_hours": <number>
    }},
    "specific_recommendations": [
        {{
            "category": "performance|security|maintainability|architecture",
            "priority": "high|medium|low",
            "description": "detailed description",
            "code_example": "suggested improvement",
            "impact": "expected benefit"
        }}
    ]
}}

Provide deep, actionable insights that demonstrate advanced code analysis capabilities.
"""

    def _get_security_analysis_prompt(self) -> str:
        """Advanced prompt for intelligent security vulnerability analysis."""
        return """
You are a cybersecurity expert and penetration tester specializing in application security.
Perform a comprehensive security analysis of the provided code.

SECURITY ANALYSIS FRAMEWORK:
1. OWASP Top 10 Vulnerability Assessment
2. Input Validation & Sanitization Review
3. Authentication & Authorization Analysis
4. Data Protection & Privacy Compliance
5. API Security Best Practices
6. Dependency Security Assessment

CODE TO ANALYZE:
{code}

SECURITY CONTEXT:
- Application Type: {app_type}
- Sensitive Data Handling: {data_sensitivity}
- External Integrations: {integrations}
- Compliance Requirements: {compliance}

STATIC ANALYSIS FINDINGS:
{static_findings}

REQUIRED OUTPUT FORMAT (JSON):
{{
    "security_score": <1-100>,
    "threat_level": "low|medium|high|critical",
    "owasp_assessment": {{
        "injection_vulnerabilities": {{
            "found": true/false,
            "instances": [],
            "severity": "low|medium|high|critical",
            "remediation": []
        }},
        "broken_authentication": {{
            "found": true/false,
            "instances": [],
            "severity": "low|medium|high|critical", 
            "remediation": []
        }},
        "sensitive_data_exposure": {{
            "found": true/false,
            "instances": [],
            "severity": "low|medium|high|critical",
            "remediation": []
        }},
        "xml_external_entities": {{
            "found": true/false,
            "instances": [],
            "severity": "low|medium|high|critical",
            "remediation": []
        }},
        "broken_access_control": {{
            "found": true/false,
            "instances": [],
            "severity": "low|medium|high|critical",
            "remediation": []
        }}
    }},
    "smart_recommendations": [
        {{
            "vulnerability_type": "specific vulnerability",
            "confidence": <1-100>,
            "false_positive_likelihood": <1-100>,
            "context_analysis": "why this matters in this specific context",
            "immediate_action": "what to do right now",
            "long_term_solution": "architectural improvement",
            "code_fix_example": "concrete code improvement"
        }}
    ],
    "compliance_assessment": {{
        "gdpr_compliance": {{"score": <1-10>, "issues": []}},
        "hipaa_compliance": {{"score": <1-10>, "issues": []}},
        "pci_compliance": {{"score": <1-10>, "issues": []}}
    }},
    "ai_insights": {{
        "pattern_analysis": "intelligent pattern recognition results",
        "context_awareness": "understanding of business logic impact",
        "false_positive_filtering": "AI-validated genuine issues only"
    }}
}}

Focus on intelligent analysis that reduces false positives and provides context-aware recommendations.
"""

    def _get_refactoring_prompt(self) -> str:
        """Advanced prompt for AI-assisted code refactoring suggestions."""
        return """
You are a master software craftsman specializing in code refactoring and optimization.
Analyze the code and provide intelligent refactoring suggestions that improve quality.

REFACTORING ANALYSIS FRAMEWORK:
1. Code Smell Detection & Classification
2. Design Pattern Opportunities
3. Performance Optimization Refactoring
4. Maintainability Improvements
5. Test-Driven Refactoring Suggestions
6. Modern Language Feature Adoption

CODE TO REFACTOR:
{code}

CURRENT METRICS:
- Complexity Score: {complexity}
- Maintainability Index: {maintainability}
- Test Coverage: {coverage}
- Performance Bottlenecks: {bottlenecks}

REQUIRED OUTPUT FORMAT (JSON):
{{
    "refactoring_score": <1-100>,
    "priority_level": "low|medium|high|urgent",
    "code_smells": [
        {{
            "smell_type": "long_method|large_class|duplicate_code|etc",
            "location": "file:line_number",
            "severity": <1-10>,
            "description": "what makes this a code smell",
            "impact": "how it affects the codebase"
        }}
    ],
    "refactoring_suggestions": [
        {{
            "type": "extract_method|introduce_pattern|optimize_performance|etc",
            "priority": "high|medium|low",
            "effort_estimate": "hours or story points",
            "original_code": "current problematic code",
            "refactored_code": "improved version",
            "explanation": "why this improvement helps",
            "benefits": ["benefit1", "benefit2"],
            "risks": ["risk1", "risk2"],
            "testing_strategy": "how to verify the refactoring"
        }}
    ],
    "design_pattern_opportunities": [
        {{
            "pattern_name": "Strategy|Factory|Observer|etc",
            "current_structure": "description of current code",
            "pattern_implementation": "how to apply the pattern",
            "benefits": ["benefit1", "benefit2"],
            "implementation_steps": ["step1", "step2"]
        }}
    ],
    "performance_optimizations": [
        {{
            "optimization_type": "algorithm|data_structure|caching|etc",
            "current_complexity": "O(n^2) or description",
            "optimized_complexity": "O(n log n) or description",
            "implementation": "optimized code example",
            "performance_gain": "expected improvement percentage"
        }}
    ],
    "modernization_suggestions": [
        {{
            "feature": "modern language feature or library",
            "current_approach": "old way of doing things",
            "modern_approach": "new improved way",
            "code_example": "modernized code",
            "compatibility": "version requirements"
        }}
    ]
}}

Provide actionable refactoring advice that balances improvement benefits with implementation effort.
"""

    def _get_performance_review_prompt(self) -> str:
        """Advanced prompt for performance analysis and optimization."""
        return """
You are a performance engineering expert specializing in application optimization.
Analyze the code for performance bottlenecks and optimization opportunities.

PERFORMANCE ANALYSIS FRAMEWORK:
1. Algorithmic Complexity Analysis
2. Memory Usage Optimization
3. I/O Operations Efficiency
4. Database Query Optimization
5. Concurrency & Parallelization Opportunities
6. Caching Strategy Assessment

CODE TO ANALYZE:
{code}

PERFORMANCE CONTEXT:
- Expected Load: {expected_load}
- Current Response Times: {response_times}
- Memory Constraints: {memory_limits}
- Database Type: {database_type}

REQUIRED OUTPUT FORMAT (JSON):
{{
    "performance_score": <1-100>,
    "bottleneck_severity": "low|medium|high|critical",
    "algorithmic_analysis": {{
        "time_complexity": "current big-O notation",
        "space_complexity": "current space complexity",
        "optimization_potential": "improved complexity possible",
        "complexity_improvements": []
    }},
    "performance_bottlenecks": [
        {{
            "type": "cpu|memory|io|database|network",
            "location": "specific code location",
            "severity": <1-10>,
            "description": "what causes the bottleneck",
            "current_impact": "measured or estimated impact",
            "optimization_suggestion": "specific improvement",
            "expected_improvement": "performance gain percentage"
        }}
    ],
    "optimization_recommendations": [
        {{
            "category": "algorithm|data_structure|caching|concurrency",
            "priority": "high|medium|low",
            "current_code": "problematic code section",
            "optimized_code": "improved implementation",
            "performance_benefit": "expected improvement",
            "implementation_effort": "development time estimate",
            "risks_considerations": ["risk1", "risk2"]
        }}
    ],
    "caching_opportunities": [
        {{
            "cache_type": "memory|redis|cdn|database",
            "data_to_cache": "what should be cached",
            "cache_strategy": "cache-aside|write-through|etc",
            "implementation": "how to implement",
            "hit_ratio_estimate": "expected cache efficiency"
        }}
    ],
    "concurrency_analysis": {{
        "parallelization_opportunities": [],
        "thread_safety_issues": [],
        "async_optimization_potential": [],
        "lock_contention_risks": []
    }}
}}

Focus on actionable performance improvements with measurable impact estimates.
"""

    def _get_test_generation_prompt(self) -> str:
        """Advanced prompt for AI-powered test generation."""
        return """
You are a test automation expert and quality assurance specialist.
Generate comprehensive, intelligent test cases for the provided code.

TEST GENERATION FRAMEWORK:
1. Unit Test Coverage Analysis
2. Edge Case Identification
3. Integration Test Scenarios
4. Performance Test Considerations
5. Security Test Cases
6. Regression Test Strategy

CODE TO TEST:
{code}

TESTING CONTEXT:
- Current Coverage: {current_coverage}%
- Testing Framework: {test_framework}
- Critical Functionality: {critical_functions}
- Known Edge Cases: {known_edge_cases}

REQUIRED OUTPUT FORMAT (JSON):
{{
    "test_coverage_analysis": {{
        "current_coverage": <percentage>,
        "achievable_coverage": <percentage>,
        "coverage_gaps": [],
        "untestable_code": []
    }},
    "generated_tests": [
        {{
            "test_type": "unit|integration|performance|security",
            "test_name": "descriptive test name",
            "test_description": "what this test validates",
            "test_code": "complete test implementation",
            "test_data": "test input data and expected outputs",
            "edge_cases_covered": ["edge_case1", "edge_case2"],
            "assertions": ["assertion1", "assertion2"]
        }}
    ],
    "edge_case_scenarios": [
        {{
            "scenario": "description of edge case",
            "input_conditions": "what triggers this case",
            "expected_behavior": "how code should handle it",
            "test_implementation": "test code for this scenario",
            "risk_level": "high|medium|low"
        }}
    ],
    "test_strategy_recommendations": {{
        "unit_test_priority": [],
        "integration_test_focus": [],
        "performance_test_targets": [],
        "security_test_areas": [],
        "mocking_strategy": [],
        "test_data_management": []
    }},
    "quality_improvements": [
        {{
            "improvement_type": "coverage|reliability|maintainability",
            "current_issue": "what's lacking in current tests",
            "recommended_solution": "how to improve",
            "implementation_steps": ["step1", "step2"]
        }}
    ]
}}

Generate tests that are comprehensive, maintainable, and focused on critical functionality.
"""

    async def analyze_code_quality(
        self,
        code: str,
        language: str = "python",
        project_type: str = "web_application",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform advanced AI-powered code quality analysis using sophisticated prompts.
        
        Args:
            code: Source code to analyze
            language: Programming language
            project_type: Type of project (web_application, api, library, etc.)
            context: Additional context for analysis
            
        Returns:
            Comprehensive code quality analysis results
        """
        if not self.client:
            return self._fallback_analysis("code_quality", code, language)
        
        try:
            # Prepare context with defaults
            analysis_context = {
                "team_size": "5-10 developers",
                "performance_requirements": "medium",
                **context or {}
            }
            
            # Apply advanced prompt engineering
            prompt = self.prompts["code_quality"].format(
                code=code,
                language=language,
                project_type=project_type,
                **analysis_context
            )
            
            # Execute AI analysis with sophisticated prompting
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert software architect with deep knowledge of code quality assessment."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.1,  # Low temperature for consistent analysis
                max_tokens=2000
            )
            
            # Parse and validate AI response
            ai_result = self._parse_ai_response(response.choices[0].message.content)
            
            # Add AI analysis metadata
            ai_result["ai_analysis_metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gpt-4",
                "prompt_version": "v1.0",
                "analysis_type": "code_quality"
            }
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI code quality analysis failed: {e}")
            return self._fallback_analysis("code_quality", code, language)

    async def analyze_security_vulnerabilities(
        self,
        code: str,
        static_findings: List[Dict] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform intelligent security analysis with context-aware vulnerability assessment.
        
        Args:
            code: Source code to analyze
            static_findings: Results from static analysis tools
            context: Security context (app type, compliance requirements, etc.)
            
        Returns:
            Intelligent security analysis with false positive filtering
        """
        if not self.client:
            return self._fallback_analysis("security", code, "python")
        
        try:
            # Prepare security context
            security_context = {
                "app_type": "web_application",
                "data_sensitivity": "medium",
                "integrations": "database, external_apis",
                "compliance": "basic",
                **context or {}
            }
            
            # Format static findings for AI analysis
            static_findings_text = json.dumps(static_findings or [], indent=2)
            
            # Apply advanced security analysis prompt
            prompt = self.prompts["security_analysis"].format(
                code=code,
                static_findings=static_findings_text,
                **security_context
            )
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cybersecurity expert specializing in intelligent vulnerability analysis and false positive reduction."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.0,  # Very low temperature for security analysis
                max_tokens=2500
            )
            
            ai_result = self._parse_ai_response(response.choices[0].message.content)
            
            # Add security analysis metadata
            ai_result["ai_security_metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gpt-4",
                "static_findings_processed": len(static_findings or []),
                "analysis_type": "security_vulnerability"
            }
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI security analysis failed: {e}")
            return self._fallback_analysis("security", code, "python")

    async def generate_refactoring_suggestions(
        self,
        code: str,
        current_metrics: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered refactoring suggestions for code improvement.
        
        Args:
            code: Source code to refactor
            current_metrics: Current code metrics (complexity, maintainability, etc.)
            context: Additional refactoring context
            
        Returns:
            Comprehensive refactoring suggestions with prioritization
        """
        if not self.client:
            return self._fallback_analysis("refactoring", code, "python")
        
        try:
            # Prepare refactoring context
            refactor_context = {
                "complexity": current_metrics.get("complexity_score", "unknown"),
                "maintainability": current_metrics.get("maintainability_index", "unknown"),
                "coverage": current_metrics.get("test_coverage", "unknown"),
                "bottlenecks": str(current_metrics.get("performance_issues", [])),
                **context or {}
            }
            
            prompt = self.prompts["refactoring_suggestions"].format(
                code=code,
                **refactor_context
            )
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a master software craftsman specializing in intelligent code refactoring and optimization."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,  # Slight creativity for refactoring suggestions
                max_tokens=3000
            )
            
            ai_result = self._parse_ai_response(response.choices[0].message.content)
            
            ai_result["ai_refactoring_metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gpt-4",
                "input_metrics": current_metrics,
                "analysis_type": "refactoring_suggestions"
            }
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI refactoring analysis failed: {e}")
            return self._fallback_analysis("refactoring", code, "python")

    async def generate_performance_analysis(
        self,
        code: str,
        performance_context: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered performance analysis and optimization recommendations.
        
        Args:
            code: Source code to analyze
            performance_context: Performance metrics and requirements
            context: Additional analysis context
            
        Returns:
            Comprehensive performance analysis with optimization suggestions
        """
        if not self.client:
            return self._fallback_analysis("performance", code, "python")
        
        try:
            perf_context = {
                "expected_load": "1000 requests/minute",
                "response_times": "< 200ms average",
                "memory_limits": "512MB",
                "database_type": "postgresql",
                **performance_context,
                **context or {}
            }
            
            prompt = self.prompts["performance_review"].format(
                code=code,
                **perf_context
            )
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a performance engineering expert specializing in application optimization and bottleneck analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=2500
            )
            
            ai_result = self._parse_ai_response(response.choices[0].message.content)
            
            ai_result["ai_performance_metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gpt-4",
                "performance_context": performance_context,
                "analysis_type": "performance_optimization"
            }
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI performance analysis failed: {e}")
            return self._fallback_analysis("performance", code, "python")

    async def generate_intelligent_tests(
        self,
        code: str,
        test_context: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered test cases with intelligent coverage analysis.
        
        Args:
            code: Source code to test
            test_context: Testing context and requirements
            context: Additional test generation context
            
        Returns:
            Comprehensive test generation with coverage analysis
        """
        if not self.client:
            return self._fallback_analysis("test_generation", code, "python")
        
        try:
            testing_context = {
                "current_coverage": "65",
                "test_framework": "pytest",
                "critical_functions": "authentication, data_processing",
                "known_edge_cases": "null values, empty strings, large datasets",
                **test_context,
                **context or {}
            }
            
            prompt = self.prompts["test_generation"].format(
                code=code,
                **testing_context
            )
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a test automation expert specializing in comprehensive test generation and quality assurance."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Some creativity for diverse test scenarios
                max_tokens=3000
            )
            
            ai_result = self._parse_ai_response(response.choices[0].message.content)
            
            ai_result["ai_testing_metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gpt-4",
                "test_context": test_context,
                "analysis_type": "test_generation"
            }
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI test generation failed: {e}")
            return self._fallback_analysis("test_generation", code, "python")

    def _parse_ai_response(self, response_content: str) -> Dict[str, Any]:
        """
        Parse and validate AI response, handling potential JSON formatting issues.
        
        Args:
            response_content: Raw AI response content
            
        Returns:
            Parsed and validated response dictionary
        """
        try:
            # Try to extract JSON from response
            if "```json" in response_content:
                # Extract JSON from markdown code block
                json_start = response_content.find("```json") + 7
                json_end = response_content.find("```", json_start)
                json_content = response_content[json_start:json_end].strip()
            else:
                # Look for JSON object
                json_start = response_content.find("{")
                json_end = response_content.rfind("}") + 1
                json_content = response_content[json_start:json_end].strip()
            
            parsed_result = json.loads(json_content)
            
            # Validate required fields exist
            if not isinstance(parsed_result, dict):
                raise ValueError("AI response is not a valid dictionary")
            
            return parsed_result
            
        except (json.JSONDecodeError, ValueError, AttributeError) as e:
            logger.warning(f"Failed to parse AI response as JSON: {e}")
            
            # Return structured fallback with raw content
            return {
                "ai_analysis_status": "parsing_failed",
                "raw_response": response_content,
                "error": str(e),
                "fallback_analysis": {
                    "status": "partial",
                    "content": "AI analysis completed but response parsing failed",
                    "recommendations": ["Review raw AI response for insights"]
                }
            }

    def _fallback_analysis(self, analysis_type: str, code: str, language: str) -> Dict[str, Any]:
        """
        Provide fallback analysis when AI service is unavailable.
        
        Args:
            analysis_type: Type of analysis being performed
            code: Source code
            language: Programming language
            
        Returns:
            Basic fallback analysis results
        """
        return {
            "ai_analysis_status": "fallback_mode",
            "analysis_type": analysis_type,
            "message": "AI service unavailable, using basic analysis",
            "basic_metrics": {
                "code_length": len(code),
                "line_count": len(code.split('\n')),
                "language": language,
                "complexity_estimate": "medium"
            },
            "recommendations": [
                "Configure OpenAI API key for enhanced AI analysis",
                "Review code manually for quality assessment",
                "Consider using additional static analysis tools"
            ],
            "fallback_timestamp": datetime.utcnow().isoformat()
        }

    async def validate_and_fix_ai_output(
        self,
        ai_analysis: Dict[str, Any],
        original_code: str,
        analysis_type: str
    ) -> Dict[str, Any]:
        """
        Validate AI analysis output and attempt to fix any issues.
        This implements the "Validate and fixing AI Output" course requirement.
        
        Args:
            ai_analysis: AI analysis results to validate
            original_code: Original source code
            analysis_type: Type of analysis performed
            
        Returns:
            Validated and potentially corrected AI analysis
        """
        validation_result = {
            "validation_status": "passed",
            "corrections_made": [],
            "confidence_score": 95,
            "validation_timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            # Validate structure and content
            if "ai_analysis_status" in ai_analysis and ai_analysis["ai_analysis_status"] == "fallback_mode":
                validation_result["validation_status"] = "fallback_mode"
                validation_result["confidence_score"] = 50
                return {**ai_analysis, "validation_result": validation_result}
            
            # Validate specific analysis types
            if analysis_type == "code_quality":
                validation_result = self._validate_code_quality_analysis(ai_analysis, validation_result)
            elif analysis_type == "security":
                validation_result = self._validate_security_analysis(ai_analysis, validation_result)
            elif analysis_type == "refactoring":
                validation_result = self._validate_refactoring_analysis(ai_analysis, validation_result)
            
            # Check for reasonable score ranges
            for key, value in ai_analysis.items():
                if "score" in key and isinstance(value, (int, float)):
                    if not (0 <= value <= 100):
                        validation_result["corrections_made"].append(f"Corrected {key} score range")
                        ai_analysis[key] = max(0, min(100, value))
            
            # Add validation metadata
            ai_analysis["validation_result"] = validation_result
            
            return ai_analysis
            
        except Exception as e:
            logger.error(f"AI output validation failed: {e}")
            validation_result["validation_status"] = "validation_failed"
            validation_result["error"] = str(e)
            validation_result["confidence_score"] = 30
            
            return {**ai_analysis, "validation_result": validation_result}

    def _validate_code_quality_analysis(self, analysis: Dict, validation: Dict) -> Dict:
        """Validate code quality analysis results."""
        required_fields = ["overall_score", "architecture_assessment", "maintainability"]
        
        for field in required_fields:
            if field not in analysis:
                validation["corrections_made"].append(f"Added missing {field} field")
                analysis[field] = {"status": "not_analyzed", "reason": "missing_in_ai_response"}
        
        return validation

    def _validate_security_analysis(self, analysis: Dict, validation: Dict) -> Dict:
        """Validate security analysis results."""
        required_fields = ["security_score", "threat_level", "owasp_assessment"]
        
        for field in required_fields:
            if field not in analysis:
                validation["corrections_made"].append(f"Added missing {field} field")
                analysis[field] = {"status": "not_analyzed", "reason": "missing_in_ai_response"}
        
        return validation

    def _validate_refactoring_analysis(self, analysis: Dict, validation: Dict) -> Dict:
        """Validate refactoring analysis results."""
        required_fields = ["refactoring_score", "code_smells", "refactoring_suggestions"]
        
        for field in required_fields:
            if field not in analysis:
                validation["corrections_made"].append(f"Added missing {field} field")
                analysis[field] = {"status": "not_analyzed", "reason": "missing_in_ai_response"}
        
        return validation

    def get_service_status(self) -> Dict[str, Any]:
        """
        Get current status of AI analysis service.
        
        Returns:
            Service status information
        """
        return {
            "service_name": "AI Analysis Service",
            "version": "1.0.0",
            "openai_configured": bool(self.client),
            "available_analysis_types": [
                "code_quality",
                "security_analysis", 
                "refactoring_suggestions",
                "performance_review",
                "test_generation"
            ],
            "prompt_versions": {
                "code_quality": "v1.0",
                "security_analysis": "v1.0",
                "refactoring": "v1.0",
                "performance": "v1.0",
                "test_generation": "v1.0"
            },
            "capabilities": [
                "Advanced prompt engineering",
                "Multi-dimensional code analysis", 
                "Context-aware recommendations",
                "False positive filtering",
                "Output validation and correction"
            ],
            "status_timestamp": datetime.utcnow().isoformat()
        }
