"""
AI Service Integration Module
Handles integration with various AI providers including OpenAI, GitHub Copilot, and others.
"""

import openai
import httpx
import logging
from typing import Optional, Dict, Any, List
from src.config import settings

logger = logging.getLogger(__name__)


class AIServiceManager:
    """Manages connections and interactions with various AI services"""
    
    def __init__(self):
        self.openai_client = None
        self.github_client = None
        self.anthropic_client = None
        self.initialized = False
        
    def initialize(self):
        """Initialize all available AI services"""
        try:
            # Initialize OpenAI
            if settings.openai_api_key:
                openai.api_key = settings.openai_api_key
                self.openai_client = openai
                logger.info("OpenAI client initialized")
            
            # Initialize GitHub integration
            if settings.github_token:
                self.github_client = httpx.Client(
                    headers={
                        "Authorization": f"Bearer {settings.github_token}",
                        "Accept": "application/vnd.github.v3+json"
                    }
                )
                logger.info("GitHub client initialized")
            
            self.initialized = True
            logger.info("AI Service Manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI services: {e}")
            raise
    
    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate all configured API keys"""
        results = {}
        
        # Test OpenAI
        if settings.openai_api_key:
            try:
                openai.api_key = settings.openai_api_key
                models = openai.Model.list()
                results['openai'] = True
                logger.info("OpenAI API key validated successfully")
            except Exception as e:
                results['openai'] = False
                logger.error(f"OpenAI API key validation failed: {e}")
        else:
            results['openai'] = False
            logger.warning("OpenAI API key not configured")
        
        # Test GitHub
        if settings.github_token:
            try:
                response = httpx.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {settings.github_token}"}
                )
                results['github'] = response.status_code == 200
                if results['github']:
                    logger.info("GitHub token validated successfully")
                else:
                    logger.error(f"GitHub token validation failed: {response.status_code}")
            except Exception as e:
                results['github'] = False
                logger.error(f"GitHub token validation failed: {e}")
        else:
            results['github'] = False
            logger.warning("GitHub token not configured")
        
        return results
    
    async def analyze_code_security(self, code_content: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code for security vulnerabilities using AI"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")
        
        try:
            prompt = f"""
            Analyze the following {language} code for security vulnerabilities:
            
            ```{language}
            {code_content}
            ```
            
            Please provide:
            1. A list of security issues found
            2. Severity level for each issue (Critical, High, Medium, Low)
            3. Recommendations for fixing each issue
            4. OWASP category if applicable
            
            Format your response as JSON with the following structure:
            {{
                "issues": [
                    {{
                        "title": "Issue title",
                        "severity": "High",
                        "description": "Detailed description",
                        "line_number": 10,
                        "recommendation": "How to fix",
                        "owasp_category": "A01:2021 – Broken Access Control"
                    }}
                ],
                "summary": "Overall security assessment",
                "risk_score": 7.5
            }}
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a cybersecurity expert specializing in code analysis."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.github_copilot_max_tokens,
                temperature=0.1
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "model_used": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"Code security analysis failed: {e}")
            raise
    
    async def generate_test_cases(self, code_content: str, language: str = "python") -> Dict[str, Any]:
        """Generate test cases for the given code"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")
        
        try:
            prompt = f"""
            Generate comprehensive test cases for the following {language} code:
            
            ```{language}
            {code_content}
            ```
            
            Please provide:
            1. Unit tests covering all functions/methods
            2. Edge cases and error scenarios
            3. Mock data where needed
            4. Test setup and teardown if required
            
            Use appropriate testing framework for {language} (pytest for Python, Jest for JavaScript, etc.)
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a software testing expert."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.github_copilot_max_tokens,
                temperature=0.2
            )
            
            return {
                "test_code": response.choices[0].message.content,
                "model_used": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"Test case generation failed: {e}")
            raise
    
    async def suggest_code_improvements(self, code_content: str, language: str = "python") -> Dict[str, Any]:
        """Suggest code improvements and refactoring opportunities"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")
        
        try:
            prompt = f"""
            Analyze the following {language} code and suggest improvements:
            
            ```{language}
            {code_content}
            ```
            
            Please provide:
            1. Code quality issues (complexity, readability, maintainability)
            2. Performance optimization opportunities
            3. Best practices violations
            4. Refactoring suggestions
            5. Design pattern recommendations
            
            Format as JSON:
            {{
                "suggestions": [
                    {{
                        "type": "performance",
                        "title": "Optimization opportunity",
                        "description": "Detailed description",
                        "line_number": 15,
                        "before": "original code",
                        "after": "improved code",
                        "impact": "medium"
                    }}
                ],
                "overall_score": 8.5,
                "summary": "Overall assessment"
            }}
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior software engineer and code reviewer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.github_copilot_max_tokens,
                temperature=0.1
            )
            
            return {
                "suggestions": response.choices[0].message.content,
                "model_used": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"Code improvement analysis failed: {e}")
            raise
    
    async def get_github_copilot_suggestions(self, code_context: str, prompt: str) -> Dict[str, Any]:
        """Get code suggestions from GitHub Copilot (if available)"""
        if not settings.github_copilot_api_key:
            logger.warning("GitHub Copilot API key not configured, falling back to OpenAI")
            return await self._get_openai_code_suggestions(code_context, prompt)
        
        try:
            # GitHub Copilot API integration (when available)
            # This is a placeholder - actual implementation depends on GitHub's API
            headers = {
                "Authorization": f"Bearer {settings.github_copilot_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": settings.github_copilot_model,
                "prompt": f"{code_context}\n\n{prompt}",
                "max_tokens": settings.github_copilot_max_tokens,
                "temperature": 0.1
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.github.com/copilot/v1/completions",  # Hypothetical endpoint
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"GitHub Copilot API failed: {response.status_code}, falling back to OpenAI")
                    return await self._get_openai_code_suggestions(code_context, prompt)
                    
        except Exception as e:
            logger.error(f"GitHub Copilot request failed: {e}, falling back to OpenAI")
            return await self._get_openai_code_suggestions(code_context, prompt)
    
    async def _get_openai_code_suggestions(self, code_context: str, prompt: str) -> Dict[str, Any]:
        """Fallback to OpenAI for code suggestions"""
        try:
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert programmer providing code suggestions."},
                    {"role": "user", "content": f"Context:\n{code_context}\n\nRequest:\n{prompt}"}
                ],
                max_tokens=settings.github_copilot_max_tokens,
                temperature=0.1
            )
            
            return {
                "suggestion": response.choices[0].message.content,
                "model_used": "gpt-4-openai",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"OpenAI code suggestion failed: {e}")
            raise


# Global instance
ai_service = AIServiceManager()


# Utility functions
async def get_ai_code_analysis(code_content: str, analysis_type: str = "security", language: str = "python") -> Dict[str, Any]:
    """
    Convenience function for AI-powered code analysis
    
    Args:
        code_content: The code to analyze
        analysis_type: Type of analysis ('security', 'quality', 'testing')
        language: Programming language
    
    Returns:
        Analysis results
    """
    if not ai_service.initialized:
        ai_service.initialize()
    
    if analysis_type == "security":
        return await ai_service.analyze_code_security(code_content, language)
    elif analysis_type == "testing":
        return await ai_service.generate_test_cases(code_content, language)
    elif analysis_type == "quality":
        return await ai_service.suggest_code_improvements(code_content, language)
    else:
        raise ValueError(f"Unknown analysis type: {analysis_type}")


async def validate_ai_services() -> Dict[str, bool]:
    """Validate all AI service connections"""
    if not ai_service.initialized:
        ai_service.initialize()
    
    return ai_service.validate_api_keys()
