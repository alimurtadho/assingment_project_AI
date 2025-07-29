# API Key Security Guide

## Overview
This guide provides recommendations for securely managing API keys in the CodeGuardian AI platform.

## 🔐 API Key Management Best Practices

### 1. Environment Variables Setup

#### Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual API keys:
   ```bash
   # AI/ML API Keys
   OPENAI_API_KEY=sk-your-actual-openai-api-key
   GITHUB_COPILOT_API_KEY=your-actual-github-copilot-key
   ANTHROPIC_API_KEY=your-actual-anthropic-key
   ```

#### GitHub Repository Secrets
For production deployment, add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `OPENAI_API_KEY`
   - `GITHUB_COPILOT_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`
   - `SECRET_KEY`

### 2. GitHub Copilot Integration

#### Getting GitHub Copilot API Access
1. **GitHub Copilot Business/Enterprise**: Contact GitHub for API access
2. **Personal Use**: Use GitHub's API with personal access token
3. **Alternative**: Use OpenAI API directly for similar functionality

#### Required Environment Variables:
```bash
GITHUB_TOKEN=ghp_your-personal-access-token
GITHUB_COPILOT_API_KEY=your-copilot-api-key  # If available
GITHUB_COPILOT_MODEL=gpt-4
GITHUB_COPILOT_MAX_TOKENS=4000
```

#### GitHub Personal Access Token Setup:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with scopes:
   - `repo` (for repository access)
   - `read:org` (for organization access)
   - `copilot` (if available)

### 3. OpenAI API Setup

#### Getting OpenAI API Key:
1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to environment variables:
   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

#### Usage in Application:
```python
# In your AI service
import openai
from src.config import settings

openai.api_key = settings.openai_api_key

# For code analysis
def analyze_code_with_ai(code_content: str):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a code security analyzer."},
            {"role": "user", "content": f"Analyze this code for security issues: {code_content}"}
        ]
    )
    return response.choices[0].message.content
```

### 4. Alternative AI Providers

#### Anthropic Claude:
```bash
ANTHROPIC_API_KEY=your-anthropic-key
```

#### Google AI:
```bash
GOOGLE_API_KEY=your-google-ai-key
```

### 5. Security Recommendations

#### ✅ DO:
- Use environment variables for all sensitive data
- Add `.env` to `.gitignore`
- Rotate API keys regularly
- Use different keys for development/staging/production
- Monitor API usage and costs
- Use least privilege principle for tokens

#### ❌ DON'T:
- Commit API keys to version control
- Share API keys in chat/email
- Use production keys in development
- Log API keys in application logs
- Use overly permissive token scopes

### 6. GitHub Actions Security

#### Workflow file example:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_COPILOT_API_KEY: ${{ secrets.GITHUB_COPILOT_API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          # Your deployment commands
```

### 7. Docker Security

#### Dockerfile best practices:
```dockerfile
# Use build args for non-sensitive config
ARG ENVIRONMENT=production

# Use secrets mount for sensitive data
RUN --mount=type=secret,id=api_keys \
    cat /run/secrets/api_keys > .env
```

#### Docker Compose with secrets:
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - ENVIRONMENT=production
    secrets:
      - openai_api_key
      - github_token

secrets:
  openai_api_key:
    external: true
  github_token:
    external: true
```

### 8. Monitoring and Alerts

#### Set up monitoring for:
- API key usage
- Failed authentication attempts
- Unusual API call patterns
- Cost thresholds

#### Example monitoring setup:
```python
import logging
from functools import wraps

def monitor_api_usage(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            logging.info(f"API call successful: {func.__name__}")
            return result
        except Exception as e:
            logging.error(f"API call failed: {func.__name__}, Error: {e}")
            raise
    return wrapper
```

### 9. API Key Validation

#### Add validation to your application:
```python
from src.config import settings
import openai

def validate_api_keys():
    """Validate all required API keys are present and working"""
    errors = []
    
    # Check OpenAI
    if not settings.openai_api_key:
        errors.append("OPENAI_API_KEY not set")
    else:
        try:
            openai.api_key = settings.openai_api_key
            openai.Model.list()
        except Exception as e:
            errors.append(f"Invalid OpenAI API key: {e}")
    
    # Check GitHub token
    if not settings.github_token:
        errors.append("GITHUB_TOKEN not set")
    
    if errors:
        raise ValueError(f"API key validation failed: {', '.join(errors)}")
```

### 10. Emergency Procedures

#### If API key is compromised:
1. **Immediately revoke** the compromised key
2. **Generate new key** with same permissions
3. **Update environment variables** in all environments
4. **Review logs** for unauthorized usage
5. **Monitor billing** for unexpected charges
6. **Rotate related credentials** (if necessary)

## Quick Setup Commands

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit with your API keys
nano .env

# 3. Validate setup
python -c "from src.config import settings; print('Config loaded successfully')"

# 4. Test API connections
python -c "
from src.config import settings
import openai
openai.api_key = settings.openai_api_key
print('OpenAI connection test:', openai.Model.list()['data'][0]['id'])
"
```

## Support

For questions about API key setup or security concerns, please:
1. Check this documentation first
2. Review GitHub repository issues
3. Contact the development team
4. Review provider-specific documentation

Remember: **Never commit sensitive API keys to version control!**
