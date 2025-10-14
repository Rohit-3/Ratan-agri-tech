#!/usr/bin/env python3
"""
Setup script for Ratan Agri Tech Payment System
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install required Python packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    directories = ["invoices", "logs", "temp"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_env_file():
    """Create environment file template"""
    print("⚙️ Creating environment file template...")
    env_content = """# Ratan Agri Tech Payment System Configuration

# Email Configuration
EMAIL_USERNAME=ratanagritech@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Merchant Details
MERCHANT_UPI=ratanagritech@axisbank
MERCHANT_NAME=Ratan Agri Tech
MERCHANT_GSTIN=27ABCDE1234Z5X
MERCHANT_ADDRESS=Jagmalpura, Sikar, Rajasthan
MERCHANT_PHONE=+91 7726017648
MERCHANT_EMAIL=ratanagritech@gmail.com

# Database
DATABASE_PATH=payments.db

# Server Configuration
HOST=0.0.0.0
PORT=8000
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print("✅ Created .env file template")
    print("⚠️  Please update the .env file with your actual credentials!")

def main():
    """Main setup function"""
    print("🔧 Setting up Ratan Agri Tech Payment System...")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required!")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Create environment file
    create_env_file()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update the .env file with your actual credentials")
    print("2. Run: python start.py")
    print("3. Open http://localhost:8000 in your browser")
    print("\n💡 For Gmail, you'll need to create an App Password:")
    print("   - Go to Google Account settings")
    print("   - Security > 2-Step Verification > App passwords")
    print("   - Generate a password for this application")

if __name__ == "__main__":
    main()

