#!/usr/bin/env python3
"""
Ratan Agri Tech - Production Payment System
World-Class UPI Payment + GST Invoice System
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
import sqlite3
import uuid
import qrcode
import io
import base64
from datetime import datetime, timedelta
import os
import json
import hashlib
import secrets
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import smtplib
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ratan Agri Tech Payment System",
    description="Production-ready UPI Payment + GST Invoice System",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_PATH = "payments.db"
INVOICE_DIR = "invoices"
LOGS_DIR = "logs"

# Create directories
os.makedirs(INVOICE_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Database initialization
def init_database():
    """Initialize production database with proper schema"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            product_name TEXT NOT NULL,
            product_id INTEGER,
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
            invoice_sent BOOLEAN DEFAULT FALSE,
            payment_method TEXT DEFAULT 'UPI',
            notes TEXT
        )
    ''')
    
    # Business settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS business_settings (
            id INTEGER PRIMARY KEY,
            business_name TEXT NOT NULL,
            business_email TEXT NOT NULL,
            business_phone TEXT NOT NULL,
            business_address TEXT NOT NULL,
            business_gstin TEXT,
            business_pan TEXT,
            merchant_upi TEXT NOT NULL,
            bank_name TEXT,
            bank_account TEXT,
            ifsc_code TEXT,
            logo_url TEXT,
            website_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT,
            image_url TEXT,
            specifications TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Email templates table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            template_name TEXT UNIQUE NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default business settings
    cursor.execute('''
        INSERT OR IGNORE INTO business_settings 
        (id, business_name, business_email, business_phone, business_address, merchant_upi)
        VALUES (1, 'Ratan Agri Tech', 'ratanagritech@gmail.com', '+91 7726017648', 
                'Jagmalpura, Sikar, Rajasthan', 'ratanagritech@axisbank')
    ''')
    
    # Insert default email templates
    cursor.execute('''
        INSERT OR IGNORE INTO email_templates (template_name, subject, body)
        VALUES 
        ('payment_confirmation', 'Payment Confirmed - Invoice {invoice_id}', 
         'Dear {customer_name},\n\nYour payment of ₹{total_amount} has been confirmed.\n\nInvoice: {invoice_id}\n\nThank you for your business!'),
        ('invoice_reminder', 'Payment Reminder - Invoice {invoice_id}',
         'Dear {customer_name},\n\nThis is a reminder for your pending payment of ₹{total_amount}.\n\nPlease complete the payment at your earliest convenience.\n\nInvoice: {invoice_id}')
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database
init_database()

# Pydantic models
class PaymentRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    product_name: str
    product_id: Optional[int] = None
    base_amount: float
    gst_rate: Optional[float] = 0.18
    notes: Optional[str] = None
    
    @validator('base_amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class PaymentConfirmation(BaseModel):
    transaction_id: str
    utr: str
    payment_method: Optional[str] = "UPI"

class BusinessSettings(BaseModel):
    business_name: str
    business_email: EmailStr
    business_phone: str
    business_address: str
    business_gstin: Optional[str] = None
    business_pan: Optional[str] = None
    merchant_upi: str
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    specifications: Optional[dict] = None

# Helper functions
def get_db_connection():
    """Get database connection with proper error handling"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def calculate_gst(base_amount: float, gst_rate: float = 0.18) -> tuple:
    """Calculate GST and total amount"""
    gst_amount = round(base_amount * gst_rate, 2)
    total_amount = round(base_amount + gst_amount, 2)
    return gst_amount, total_amount

def generate_upi_link(merchant_upi: str, merchant_name: str, amount: float, invoice_id: str) -> str:
    """Generate UPI deep link for payment"""
    merchant_name_encoded = merchant_name.replace(" ", "+")
    return f"upi://pay?pa={merchant_upi}&pn={merchant_name_encoded}&am={amount}&cu=INR&tn={invoice_id}"

def generate_qr_code(upi_link: str) -> str:
    """Generate QR code for UPI link"""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(upi_link)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode()
    except Exception as e:
        logger.error(f"QR code generation error: {e}")
        return ""

def get_business_settings():
    """Get business settings from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM business_settings WHERE id = 1")
    settings = cursor.fetchone()
    conn.close()
    
    if not settings:
        # Return default settings
        return {
            'business_name': 'Ratan Agri Tech',
            'business_email': 'ratanagritech@gmail.com',
            'business_phone': '+91 7726017648',
            'business_address': 'Jagmalpura, Sikar, Rajasthan',
            'business_gstin': None,
            'merchant_upi': 'ratanagritech@axisbank'
        }
    
    return dict(settings)

def generate_invoice_pdf(transaction_data: dict, business_settings: dict) -> str:
    """Generate professional GST invoice PDF"""
    try:
        invoice_id = transaction_data['invoice_id']
        pdf_path = os.path.join(INVOICE_DIR, f"{invoice_id}.pdf")
        
        doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkgreen
        )
        
        # Build story
        story = []
        
        # Title
        story.append(Paragraph("TAX INVOICE", title_style))
        story.append(Spacer(1, 20))
        
        # Business details
        business_data = [
            [Paragraph(f"<b>{business_settings['business_name']}</b>", styles['Heading2'])],
            [Paragraph(business_settings['business_address'], styles['Normal'])],
            [Paragraph(f"Phone: {business_settings['business_phone']}", styles['Normal'])],
            [Paragraph(f"Email: {business_settings['business_email']}", styles['Normal'])],
        ]
        
        if business_settings.get('business_gstin'):
            business_data.append([Paragraph(f"GSTIN: {business_settings['business_gstin']}", styles['Normal'])])
        
        # Invoice details
        invoice_data = [
            [Paragraph(f"<b>Invoice No:</b> {invoice_id}", styles['Normal'])],
            [Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d %B %Y')}", styles['Normal'])],
        ]
        
        # Combine business and invoice details
        header_data = [
            [Table(business_data, colWidths=[4*inch]), Table(invoice_data, colWidths=[2*inch])]
        ]
        
        header_table = Table(header_data, colWidths=[4*inch, 2*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        
        story.append(header_table)
        story.append(Spacer(1, 30))
        
        # Customer details
        story.append(Paragraph("Bill To:", styles['Heading3']))
        customer_data = [
            [Paragraph(f"<b>Name:</b> {transaction_data['customer_name']}", styles['Normal'])],
            [Paragraph(f"<b>Email:</b> {transaction_data['customer_email']}", styles['Normal'])],
        ]
        
        if transaction_data.get('customer_phone'):
            customer_data.append([Paragraph(f"<b>Phone:</b> {transaction_data['customer_phone']}", styles['Normal'])])
        
        customer_table = Table(customer_data, colWidths=[4*inch])
        story.append(customer_table)
        story.append(Spacer(1, 20))
        
        # Items table
        story.append(Paragraph("Item Details:", styles['Heading3']))
        
        items_data = [
            ['Description', 'Qty', 'Rate', 'Amount'],
            [transaction_data['product_name'], '1', f'₹{transaction_data["base_amount"]:.2f}', f'₹{transaction_data["base_amount"]:.2f}']
        ]
        
        items_table = Table(items_data, colWidths=[3*inch, 0.8*inch, 1*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 20))
        
        # Amount breakdown
        amount_data = [
            ['Subtotal', f'₹{transaction_data["base_amount"]:.2f}'],
            [f'GST ({transaction_data["gst_rate"]*100:.0f}%)', f'₹{transaction_data["gst_amount"]:.2f}'],
            ['Total Amount', f'₹{transaction_data["total_amount"]:.2f}']
        ]
        
        amount_table = Table(amount_data, colWidths=[2*inch, 1*inch])
        amount_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTSIZE', (0, -1), (1, -1), 14),
            ('LINEBELOW', (0, -1), (1, -1), 1, colors.black),
            ('TOPPADDING', (0, -1), (1, -1), 10),
        ]))
        
        # Align amount table to right
        amount_data_wrapper = [[amount_table]]
        amount_wrapper_table = Table(amount_data_wrapper, colWidths=[6*inch])
        amount_wrapper_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'RIGHT'),
        ]))
        
        story.append(amount_wrapper_table)
        story.append(Spacer(1, 30))
        
        # Payment details
        story.append(Paragraph("Payment Details:", styles['Heading3']))
        payment_data = [
            [Paragraph(f"<b>Payment Method:</b> UPI", styles['Normal'])],
            [Paragraph(f"<b>UPI ID:</b> {business_settings['merchant_upi']}", styles['Normal'])],
        ]
        
        if transaction_data.get('utr'):
            payment_data.append([Paragraph(f"<b>UTR/Transaction ID:</b> {transaction_data['utr']}", styles['Normal'])])
        
        payment_table = Table(payment_data, colWidths=[4*inch])
        story.append(payment_table)
        story.append(Spacer(1, 30))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        story.append(Paragraph("This is a system-generated GST invoice.", footer_style))
        story.append(Paragraph("Thank you for your business!", footer_style))
        
        # Build PDF
        doc.build(story)
        
        logger.info(f"Invoice generated: {pdf_path}")
        return pdf_path
        
    except Exception as e:
        logger.error(f"Invoice generation error: {e}")
        raise HTTPException(status_code=500, detail="Invoice generation failed")

def send_email_notification(customer_email: str, customer_name: str, invoice_id: str, 
                           total_amount: float, pdf_path: str, business_settings: dict):
    """Send professional email notification"""
    try:
        # Email configuration (should be in environment variables in production)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        email_username = business_settings['business_email']
        email_password = os.getenv('EMAIL_PASSWORD', 'your_app_password')  # Use environment variable
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = email_username
        msg['To'] = customer_email
        msg['Subject'] = f"Payment Confirmed - Invoice {invoice_id} - {business_settings['business_name']}"
        
        # Email body
        body = f"""
Dear {customer_name},

Thank you for your payment of ₹{total_amount:.2f} via UPI.

Your payment has been successfully processed and we have generated your GST invoice.

Payment Details:
- Invoice Number: {invoice_id}
- Amount Paid: ₹{total_amount:.2f}
- Payment Method: UPI
- Date: {datetime.now().strftime('%d %B %Y')}

Please find your invoice attached to this email.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
{business_settings['business_name']} Team
Phone: {business_settings['business_phone']}
Email: {business_settings['business_email']}
Address: {business_settings['business_address']}

---
This is an automated email. Please do not reply to this email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {invoice_id}.pdf'
            )
            msg.attach(part)
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email_username, email_password)
        text = msg.as_string()
        server.sendmail(email_username, customer_email, text)
        server.quit()
        
        logger.info(f"Email sent successfully to {customer_email}")
        return True
        
    except Exception as e:
        logger.error(f"Email sending failed: {e}")
        return False

# API Routes
@app.get("/")
async def root():
    return {
        "message": "Ratan Agri Tech Payment System API",
        "version": "2.0.0",
        "status": "active",
        "features": [
            "UPI Payment Processing",
            "GST Invoice Generation", 
            "Email Automation",
            "Transaction Management",
            "Business Dashboard"
        ]
    }

@app.post("/api/create-payment")
async def create_payment(payment: PaymentRequest, background_tasks: BackgroundTasks):
    """Create a new payment request"""
    try:
        # Calculate GST and total
        gst_amount, total_amount = calculate_gst(payment.base_amount, payment.gst_rate)
        
        # Generate unique IDs
        transaction_id = str(uuid.uuid4())
        invoice_id = f"INV-{datetime.now().strftime('%Y%m%d')}-{transaction_id[:8].upper()}"
        
        # Get business settings
        business_settings = get_business_settings()
        
        # Generate UPI link
        upi_link = generate_upi_link(
            business_settings['merchant_upi'],
            business_settings['business_name'],
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
            (transaction_id, customer_name, customer_email, customer_phone, product_name, product_id,
             base_amount, gst_rate, gst_amount, total_amount, merchant_upi, merchant_name, invoice_id, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction_id, payment.customer_name, payment.customer_email, payment.customer_phone,
            payment.product_name, payment.product_id, payment.base_amount, payment.gst_rate, 
            gst_amount, total_amount, business_settings['merchant_upi'], 
            business_settings['business_name'], invoice_id, payment.notes
        ))
        conn.commit()
        conn.close()
        
        logger.info(f"Payment created: {transaction_id}")
        
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
            "merchant_upi": business_settings['merchant_upi'],
            "merchant_name": business_settings['business_name'],
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")

@app.post("/api/confirm-payment")
async def confirm_payment(confirmation: PaymentConfirmation, background_tasks: BackgroundTasks):
    """Confirm payment with UTR"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update transaction
        cursor.execute('''
            UPDATE transactions 
            SET utr = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = ?
            WHERE transaction_id = ?
        ''', (confirmation.utr, confirmation.payment_method, confirmation.transaction_id))
        
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
        business_settings = get_business_settings()
        pdf_path = generate_invoice_pdf(dict(transaction), business_settings)
        
        # Send email notification in background
        background_tasks.add_task(
            send_email_notification,
            transaction['customer_email'],
            transaction['customer_name'],
            transaction['invoice_id'],
            transaction['total_amount'],
            pdf_path,
            business_settings
        )
        
        # Mark invoice as sent
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE transactions SET invoice_sent = TRUE WHERE transaction_id = ?', (confirmation.transaction_id,))
        conn.commit()
        conn.close()
        
        logger.info(f"Payment confirmed: {confirmation.transaction_id}")
        
        return {
            "success": True,
            "message": "Payment confirmed and invoice sent",
            "transaction_id": confirmation.transaction_id,
            "invoice_id": transaction['invoice_id'],
            "invoice_url": f"/api/invoice/{transaction['invoice_id']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment confirmation error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment confirmation failed: {str(e)}")

@app.get("/api/transaction/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Get transaction details"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM transactions WHERE transaction_id = ?', (transaction_id,))
        transaction = cursor.fetchone()
        conn.close()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return dict(transaction)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get transaction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transaction: {str(e)}")

@app.get("/api/invoice/{invoice_id}")
async def download_invoice(invoice_id: str):
    """Download invoice PDF"""
    try:
        pdf_path = os.path.join(INVOICE_DIR, f"{invoice_id}.pdf")
        if os.path.exists(pdf_path):
            return FileResponse(pdf_path, media_type='application/pdf', filename=f"{invoice_id}.pdf")
        else:
            raise HTTPException(status_code=404, detail="Invoice not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download invoice error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download invoice: {str(e)}")

@app.get("/api/business-settings")
async def get_business_settings_api():
    """Get business settings"""
    return get_business_settings()

@app.post("/api/business-settings")
async def update_business_settings(settings: BusinessSettings):
    """Update business settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO business_settings 
            (id, business_name, business_email, business_phone, business_address, 
             business_gstin, business_pan, merchant_upi, bank_name, bank_account, 
             ifsc_code, logo_url, website_url, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            settings.business_name, settings.business_email, settings.business_phone,
            settings.business_address, settings.business_gstin, settings.business_pan,
            settings.merchant_upi, settings.bank_name, settings.bank_account,
            settings.ifsc_code, settings.logo_url, settings.website_url
        ))
        
        conn.commit()
        conn.close()
        
        logger.info("Business settings updated")
        return {"success": True, "message": "Business settings updated successfully"}
        
    except Exception as e:
        logger.error(f"Update business settings error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Get dashboard analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Total transactions
        cursor.execute("SELECT COUNT(*) as total FROM transactions")
        total_transactions = cursor.fetchone()['total']
        
        # Total revenue
        cursor.execute("SELECT SUM(total_amount) as revenue FROM transactions WHERE status = 'paid'")
        total_revenue = cursor.fetchone()['revenue'] or 0
        
        # Recent transactions
        cursor.execute('''
            SELECT * FROM transactions 
            ORDER BY created_at DESC 
            LIMIT 10
        ''')
        recent_transactions = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "total_transactions": total_transactions,
            "total_revenue": total_revenue,
            "recent_transactions": recent_transactions
        }
        
    except Exception as e:
        logger.error(f"Dashboard data error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Ratan Agri Tech Payment System v2.0.0")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

