from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import sqlite3
import uuid
import qrcode
import io
import base64
from datetime import datetime
import os
from email_service import send_invoice_email
from invoice_generator import generate_invoice_pdf
import json

app = FastAPI(title="Ratan Agri Tech Payment System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_PATH = "payments.db"

def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            product_name TEXT NOT NULL,
            base_amount REAL NOT NULL,
            gst_rate REAL DEFAULT 0.18,
            gst_amount REAL NOT NULL,
            total_amount REAL NOT NULL,
            merchant_upi TEXT NOT NULL,
            merchant_name TEXT NOT NULL,
            utr TEXT,
            status TEXT DEFAULT 'pending',
            invoice_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            paid_at TIMESTAMP,
            invoice_sent BOOLEAN DEFAULT FALSE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            merchant_upi TEXT,
            merchant_name TEXT,
            merchant_gstin TEXT,
            merchant_address TEXT,
            merchant_phone TEXT,
            merchant_email TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# Pydantic models
class PaymentRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    product_name: str
    base_amount: float
    gst_rate: Optional[float] = 0.18

class PaymentConfirmation(BaseModel):
    transaction_id: str
    utr: str

class SettingsUpdate(BaseModel):
    merchant_upi: str
    merchant_name: str
    merchant_gstin: Optional[str] = None
    merchant_address: Optional[str] = None
    merchant_phone: Optional[str] = None
    merchant_email: Optional[str] = None

# Helper functions
def get_db_connection():
    return sqlite3.connect(DATABASE_PATH)

def calculate_gst(base_amount: float, gst_rate: float = 0.18) -> tuple:
    gst_amount = base_amount * gst_rate
    total_amount = base_amount + gst_amount
    return gst_amount, total_amount

def generate_upi_link(merchant_upi: str, merchant_name: str, amount: float, invoice_id: str) -> str:
    """Generate UPI deep link"""
    return f"upi://pay?pa={merchant_upi}&pn={merchant_name}&am={amount}&cu=INR&tn={invoice_id}"

def generate_qr_code(upi_link: str) -> str:
    """Generate QR code for UPI link"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(upi_link)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

def get_merchant_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE id = 1")
    settings = cursor.fetchone()
    conn.close()
    
    if not settings:
        # Default settings - should be updated by admin
        return {
            'merchant_upi': 'ratanagritech@axisbank',
            'merchant_name': 'Ratan Agri Tech',
            'merchant_gstin': None,
            'merchant_address': 'Jagmalpura, Sikar, Rajasthan',
            'merchant_phone': '+91 7726017648',
            'merchant_email': 'ratanagritech@gmail.com'
        }
    
    return {
        'merchant_upi': settings[1],
        'merchant_name': settings[2],
        'merchant_gstin': settings[3],
        'merchant_address': settings[4],
        'merchant_phone': settings[5],
        'merchant_email': settings[6]
    }

# API Routes
@app.get("/")
async def root():
    return {"message": "Ratan Agri Tech Payment System API", "status": "active"}

@app.post("/api/create-payment")
async def create_payment(payment: PaymentRequest):
    try:
        # Calculate GST and total
        gst_amount, total_amount = calculate_gst(payment.base_amount, payment.gst_rate)
        
        # Generate unique transaction and invoice IDs
        transaction_id = str(uuid.uuid4())
        invoice_id = f"INV-{datetime.now().strftime('%Y%m%d')}-{transaction_id[:8].upper()}"
        
        # Get merchant settings
        merchant_settings = get_merchant_settings()
        
        # Generate UPI link
        upi_link = generate_upi_link(
            merchant_settings['merchant_upi'],
            merchant_settings['merchant_name'],
            total_amount,
            invoice_id
        )
        
        # Generate QR code
        qr_code = generate_qr_code(upi_link)
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transactions 
            (transaction_id, customer_name, customer_email, customer_phone, product_name, 
             base_amount, gst_rate, gst_amount, total_amount, merchant_upi, merchant_name, invoice_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction_id, payment.customer_name, payment.customer_email, payment.customer_phone,
            payment.product_name, payment.base_amount, payment.gst_rate, gst_amount, total_amount,
            merchant_settings['merchant_upi'], merchant_settings['merchant_name'], invoice_id
        ))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "invoice_id": invoice_id,
            "base_amount": payment.base_amount,
            "gst_rate": payment.gst_rate,
            "gst_amount": gst_amount,
            "total_amount": total_amount,
            "upi_link": upi_link,
            "qr_code": qr_code,
            "merchant_upi": merchant_settings['merchant_upi'],
            "merchant_name": merchant_settings['merchant_name']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

@app.post("/api/confirm-payment")
async def confirm_payment(confirmation: PaymentConfirmation):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update transaction with UTR
        cursor.execute('''
            UPDATE transactions 
            SET utr = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP
            WHERE transaction_id = ?
        ''', (confirmation.utr, confirmation.transaction_id))
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get transaction details
        cursor.execute('SELECT * FROM transactions WHERE transaction_id = ?', (confirmation.transaction_id,))
        transaction = cursor.fetchone()
        conn.close()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Generate invoice PDF
        merchant_settings = get_merchant_settings()
        pdf_path = generate_invoice_pdf(transaction, merchant_settings)
        
        # Send invoice email
        try:
            send_invoice_email(
                customer_email=transaction[3],  # customer_email
                customer_name=transaction[2],   # customer_name
                invoice_id=transaction[14],     # invoice_id
                total_amount=transaction[9],    # total_amount
                pdf_path=pdf_path,
                merchant_email=merchant_settings['merchant_email']
            )
            
            # Mark invoice as sent
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('UPDATE transactions SET invoice_sent = TRUE WHERE transaction_id = ?', (confirmation.transaction_id,))
            conn.commit()
            conn.close()
            
        except Exception as email_error:
            print(f"Email sending failed: {email_error}")
        
        return {
            "success": True,
            "message": "Payment confirmed and invoice sent",
            "transaction_id": confirmation.transaction_id,
            "invoice_id": transaction[14]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error confirming payment: {str(e)}")

@app.get("/api/transaction/{transaction_id}")
async def get_transaction(transaction_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM transactions WHERE transaction_id = ?', (transaction_id,))
        transaction = cursor.fetchone()
        conn.close()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {
            "transaction_id": transaction[1],
            "customer_name": transaction[2],
            "customer_email": transaction[3],
            "customer_phone": transaction[4],
            "product_name": transaction[5],
            "base_amount": transaction[6],
            "gst_rate": transaction[7],
            "gst_amount": transaction[8],
            "total_amount": transaction[9],
            "merchant_upi": transaction[10],
            "merchant_name": transaction[11],
            "utr": transaction[12],
            "status": transaction[13],
            "invoice_id": transaction[14],
            "created_at": transaction[15],
            "paid_at": transaction[16],
            "invoice_sent": transaction[17]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transaction: {str(e)}")

@app.get("/api/settings")
async def get_settings():
    return get_merchant_settings()

@app.post("/api/settings")
async def update_settings(settings: SettingsUpdate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert or update settings
        cursor.execute('''
            INSERT OR REPLACE INTO settings 
            (id, merchant_upi, merchant_name, merchant_gstin, merchant_address, merchant_phone, merchant_email, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            settings.merchant_upi, settings.merchant_name, settings.merchant_gstin,
            settings.merchant_address, settings.merchant_phone, settings.merchant_email
        ))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Settings updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating settings: {str(e)}")

@app.get("/api/invoice/{invoice_id}")
async def download_invoice(invoice_id: str):
    try:
        pdf_path = f"invoices/{invoice_id}.pdf"
        if os.path.exists(pdf_path):
            return FileResponse(pdf_path, media_type='application/pdf', filename=f"{invoice_id}.pdf")
        else:
            raise HTTPException(status_code=404, detail="Invoice not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading invoice: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

