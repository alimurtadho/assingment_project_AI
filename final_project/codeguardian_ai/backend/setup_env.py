#!/usr/bin/env python3
"""
Environment Setup Script for CodeGuardian AI
Helps users configure their environment variables securely.
"""

import os
import sys
import subprocess
from pathlib import Path
import secrets
import string


def generate_secret_key(length: int = 32) -> str:
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def check_env_file():
    """Check if .env file exists, create from template if not"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("📋 Creating .env file from template...")
            with open(env_example, 'r') as src, open(env_file, 'w') as dst:
                dst.write(src.read())
            print("✅ .env file created successfully!")
        else:
            print("❌ .env.example not found. Please ensure you're in the correct directory.")
            return False
    else:
        print("✅ .env file already exists")
    
    return True


def setup_basic_security():
    """Set up basic security configurations"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("❌ .env file not found")
        return
    
    # Read current env file
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Generate new secret key if using default
    if "your-super-secret-key-change-in-production" in content:
        new_secret = generate_secret_key(64)
        content = content.replace(
            "SECRET_KEY=your-super-secret-key-change-in-production",
            f"SECRET_KEY={new_secret}"
        )
        print("🔑 Generated new SECRET_KEY")
    
    # Write back to file
    with open(env_file, 'w') as f:
        f.write(content)
    
    print("✅ Basic security setup completed")


def prompt_for_api_keys():
    """Interactively prompt for API keys"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("❌ .env file not found")
        return
    
    print("\n🔐 API Key Setup")
    print("=" * 50)
    print("You can skip any API key by pressing Enter.")
    print("You can always add them later by editing the .env file.")
    print()
    
    # API key prompts
    api_keys = {
        "OPENAI_API_KEY": "OpenAI API Key (sk-...)",
        "GITHUB_TOKEN": "GitHub Personal Access Token (ghp_...)",
        "GITHUB_COPILOT_API_KEY": "GitHub Copilot API Key (if available)",
        "ANTHROPIC_API_KEY": "Anthropic API Key",
        "GOOGLE_API_KEY": "Google AI API Key"
    }
    
    # Read current env content
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Update API keys
    updated_lines = []
    for line in lines:
        updated = False
        for key, description in api_keys.items():
            if line.startswith(f"{key}=") and ("your-" in line or "sk-your-" in line):
                user_input = input(f"Enter {description}: ").strip()
                if user_input:
                    updated_lines.append(f"{key}={user_input}\n")
                    print(f"✅ {key} updated")
                else:
                    updated_lines.append(line)
                    print(f"⏭️  {key} skipped")
                updated = True
                break
        
        if not updated:
            updated_lines.append(line)
    
    # Write back to file
    with open(env_file, 'w') as f:
        f.writelines(updated_lines)
    
    print("\n✅ API key setup completed!")


def validate_setup():
    """Validate the environment setup"""
    print("\n🔍 Validating setup...")
    
    # Check if we can import required modules
    try:
        import sys
        sys.path.append("src")
        from config import settings
        print("✅ Configuration loaded successfully")
        
        # Check critical settings
        if settings.secret_key != "your-super-secret-key-change-in-production":
            print("✅ SECRET_KEY is configured")
        else:
            print("⚠️  SECRET_KEY is still using default value")
        
        if settings.openai_api_key:
            print("✅ OpenAI API key is configured")
        else:
            print("ℹ️  OpenAI API key not configured")
        
        if settings.github_token:
            print("✅ GitHub token is configured")
        else:
            print("ℹ️  GitHub token not configured")
        
    except ImportError as e:
        print(f"❌ Failed to import configuration: {e}")
    except Exception as e:
        print(f"❌ Configuration validation failed: {e}")


def show_next_steps():
    """Show next steps for the user"""
    print("\n🚀 Next Steps")
    print("=" * 50)
    print("1. Start the application:")
    print("   uvicorn src.main:app --reload")
    print()
    print("2. Test API endpoints:")
    print("   curl http://localhost:8000/health")
    print()
    print("3. Access API documentation:")
    print("   http://localhost:8000/docs")
    print()
    print("4. For production deployment:")
    print("   - Set ENVIRONMENT=production")
    print("   - Set DEBUG=false")
    print("   - Use secure database credentials")
    print("   - Configure proper CORS origins")
    print()
    print("📚 For more information, check:")
    print("   - API_KEY_SECURITY_GUIDE.md")
    print("   - README.md")


def main():
    """Main setup function"""
    print("🛡️  CodeGuardian AI - Environment Setup")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Check if we're in the right place
    if not Path("src").exists():
        print("❌ 'src' directory not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Step 1: Check/create .env file
    print("\n📋 Step 1: Environment file setup")
    if not check_env_file():
        sys.exit(1)
    
    # Step 2: Set up basic security
    print("\n🔐 Step 2: Security setup")
    setup_basic_security()
    
    # Step 3: API key setup
    print("\n🔑 Step 3: API key configuration")
    choice = input("Do you want to configure API keys now? (y/N): ").lower()
    if choice in ['y', 'yes']:
        prompt_for_api_keys()
    else:
        print("⏭️  API key setup skipped. You can configure them later in .env file.")
    
    # Step 4: Validate setup
    print("\n✅ Step 4: Validation")
    validate_setup()
    
    # Step 5: Show next steps
    show_next_steps()
    
    print("\n🎉 Setup completed successfully!")


if __name__ == "__main__":
    main()
