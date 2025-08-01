# 🔐 GitHub Secrets Configuration

## Required Secrets for CI/CD Pipeline

Configure these secrets in your GitHub repository settings:
**Repository → Settings → Secrets and variables → Actions**

### 🔧 Core Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SONAR_TOKEN` | SonarQube authentication token | `sqb_1234567890abcdef...` |
| `SONAR_HOST_URL` | SonarQube server URL | `https://sonarcloud.io` |
| `SNYK_TOKEN` | Snyk security scanning token | `12345678-1234-1234-1234-123456789012` |
| `CODECOV_TOKEN` | Codecov coverage reporting token | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |

### 📢 Notification Secrets (Optional)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SLACK_WEBHOOK` | Slack webhook for notifications | `https://hooks.slack.com/services/...` |
| `DISCORD_WEBHOOK` | Discord webhook for notifications | `https://discord.com/api/webhooks/...` |

### 🚀 Deployment Secrets (Future Use)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `HEROKU_API_KEY` | Heroku deployment key | `12345678-1234-1234-1234-123456789012` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `DOCKER_USERNAME` | Docker Hub username | `yourusername` |
| `DOCKER_PASSWORD` | Docker Hub password/token | `dckr_pat_1234567890abcdef` |

## 🛠️ Setup Instructions

### Step 1: SonarQube Setup
1. Visit [SonarCloud.io](https://sonarcloud.io)
2. Login with your GitHub account
3. Create a new project: `codeguardian-ai`
4. Generate a token: **My Account → Security → Generate Tokens**
5. Copy the token and add as `SONAR_TOKEN` secret

### Step 2: Snyk Setup  
1. Visit [Snyk.io](https://snyk.io)
2. Create a free account
3. Go to **Settings → General → Auth Token**
4. Copy the token and add as `SNYK_TOKEN` secret

### Step 3: Codecov Setup
1. Visit [Codecov.io](https://codecov.io)
2. Login with GitHub
3. Add your repository
4. Copy the token and add as `CODECOV_TOKEN` secret

### Step 4: Adding Secrets to GitHub
```bash
# Navigate to your repository on GitHub
# Go to Settings → Secrets and variables → Actions
# Click "New repository secret"
# Add each secret with its corresponding value
```

## 🔍 Secret Validation

Run this command to verify secrets are properly configured:

```bash
# Check if secrets are accessible (this won't show values)
gh secret list
```

## 🛡️ Security Best Practices

- ✅ **Never commit secrets** to your repository
- ✅ **Use environment-specific secrets** for different environments
- ✅ **Rotate secrets regularly** (every 90 days)
- ✅ **Use minimal permissions** for each token
- ✅ **Monitor secret usage** in Actions logs
- ✅ **Remove unused secrets** to reduce attack surface

## 🔄 Secret Rotation Schedule

| Secret | Rotation Frequency | Next Due |
|--------|-------------------|----------|
| SONAR_TOKEN | 90 days | Track in calendar |
| SNYK_TOKEN | 90 days | Track in calendar |
| CODECOV_TOKEN | 180 days | Track in calendar |
| Deployment Keys | 30 days | Track in calendar |
