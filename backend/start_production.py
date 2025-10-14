#!/usr/bin/env python3
"""
Ratan Agri Tech - Production Payment System Startup
World-Class UPI Payment + GST Invoice System
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    """Start the production FastAPI server"""
    
    print("🚀 Starting Ratan Agri Tech Payment System v2.0.0")
    print("💳 Production-Ready UPI Payment + GST Invoice System")
    print("=" * 60)
    print("🌐 API Documentation: http://localhost:8000/api/docs")
    print("📊 Admin Dashboard: http://localhost:8000/api/dashboard")
    print("🔧 Business Settings: http://localhost:8000/api/business-settings")
    print("=" * 60)
    
    # Start server with production settings
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()

