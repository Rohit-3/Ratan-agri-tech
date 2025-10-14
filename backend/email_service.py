import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from datetime import datetime

# Email configuration - should be moved to environment variables
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_USERNAME = "ratanagritech@gmail.com"  # Replace with actual email
EMAIL_PASSWORD = "your_app_password"  # Replace with Gmail app password

def send_invoice_email(customer_email, customer_name, invoice_id, total_amount, pdf_path, merchant_email):
    """Send invoice email to customer and merchant"""
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USERNAME
        msg['To'] = customer_email
        msg['Subject'] = f"Invoice {invoice_id} - Payment Received - Ratan Agri Tech"
        
        # Email body
        body = f"""
Dear {customer_name},

Thank you for your payment of ₹{total_amount:.2f} via UPI.

Your payment has been successfully processed and we have generated your GST invoice.

Invoice Details:
- Invoice Number: {invoice_id}
- Amount Paid: ₹{total_amount:.2f}
- Payment Method: UPI
- Date: {datetime.now().strftime('%d %B %Y')}

Please find your invoice attached to this email.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
Ratan Agri Tech Team
Phone: +91 7726017648
Email: ratanagritech@gmail.com
Address: Jagmalpura, Sikar, Rajasthan

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
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USERNAME, customer_email, text)
        server.quit()
        
        # Send copy to merchant
        send_merchant_notification(merchant_email, customer_name, invoice_id, total_amount, pdf_path)
        
        print(f"Invoice email sent successfully to {customer_email}")
        return True
        
    except Exception as e:
        print(f"Error sending invoice email: {str(e)}")
        return False

def send_merchant_notification(merchant_email, customer_name, invoice_id, total_amount, pdf_path):
    """Send notification to merchant about new payment"""
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USERNAME
        msg['To'] = merchant_email
        msg['Subject'] = f"New Payment Received - Invoice {invoice_id}"
        
        body = f"""
New Payment Received!

Customer Details:
- Name: {customer_name}
- Invoice: {invoice_id}
- Amount: ₹{total_amount:.2f}
- Date: {datetime.now().strftime('%d %B %Y at %I:%M %p')}

The customer has been sent their invoice automatically.

Please check your records and update your accounting system accordingly.

Best regards,
Ratan Agri Tech Payment System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF copy
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {invoice_id}_copy.pdf'
            )
            msg.attach(part)
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USERNAME, merchant_email, text)
        server.quit()
        
        print(f"Merchant notification sent to {merchant_email}")
        return True
        
    except Exception as e:
        print(f"Error sending merchant notification: {str(e)}")
        return False

def send_payment_reminder(customer_email, customer_name, invoice_id, total_amount, upi_link):
    """Send payment reminder to customer"""
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USERNAME
        msg['To'] = customer_email
        msg['Subject'] = f"Payment Reminder - Invoice {invoice_id} - Ratan Agri Tech"
        
        body = f"""
Dear {customer_name},

This is a friendly reminder that your payment for Invoice {invoice_id} is pending.

Payment Details:
- Invoice Number: {invoice_id}
- Amount Due: ₹{total_amount:.2f}
- Due Date: {datetime.now().strftime('%d %B %Y')}

To complete your payment, please use the UPI link below or scan the QR code:
{upi_link}

If you have already made the payment, please ignore this email.

If you have any questions, please contact us at +91 7726017648 or ratanagritech@gmail.com

Thank you for your business!

Best regards,
Ratan Agri Tech Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USERNAME, customer_email, text)
        server.quit()
        
        print(f"Payment reminder sent to {customer_email}")
        return True
        
    except Exception as e:
        print(f"Error sending payment reminder: {str(e)}")
        return False

