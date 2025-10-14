#!/usr/bin/env python3
"""
Ratan Agri Tech Payment System Backend
UPI Payment + GST Invoice System (No-KYC)

This script starts the FastAPI backend server for the payment system.
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    """Start the FastAPI server"""
    
    print("🚀 Starting Ratan Agri Tech Payment System Backend...")
    print("📧 UPI Payment + GST Invoice System (No-KYC)")
    print("=" * 50)
    
    # Check if required directories exist
    os.makedirs("invoices", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Start server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()

