#!/usr/bin/env python3
"""
Simple FastAPI server for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Ratan Agri Tech Payment System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PaymentRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str = ""
    product_name: str
    base_amount: float
    gst_rate: float = 0.18

@app.get("/")
async def root():
    return {"message": "Ratan Agri Tech Payment System API", "status": "active"}

@app.post("/api/create-payment")
async def create_payment(payment: PaymentRequest):
    try:
        # Calculate GST and total
        gst_amount = payment.base_amount * payment.gst_rate
        total_amount = payment.base_amount + gst_amount
        
        # Mock response for testing
        return {
            "success": True,
            "transaction_id": "test-123",
            "invoice_id": "INV-TEST-123",
            "base_amount": payment.base_amount,
            "gst_rate": payment.gst_rate,
            "gst_amount": gst_amount,
            "total_amount": total_amount,
            "upi_link": f"upi://pay?pa=ratanagritech@axisbank&pn=Ratan+Agri+Tech&am={total_amount}&cu=INR&tn=INV-TEST-123",
            "qr_code": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",  # 1x1 pixel PNG
            "merchant_upi": "ratanagritech@axisbank",
            "merchant_name": "Ratan Agri Tech"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/confirm-payment")
async def confirm_payment(data: dict):
    return {
        "success": True,
        "message": "Payment confirmed (test mode)",
        "transaction_id": data.get("transaction_id"),
        "invoice_id": "INV-TEST-123"
    }

if __name__ == "__main__":
    print("🚀 Starting Ratan Agri Tech Payment System (Test Mode)...")
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
