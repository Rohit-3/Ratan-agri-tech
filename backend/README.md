# 🚀 Ratan Agri Tech Payment System

A complete **UPI Payment + GST Invoice System** with **No-KYC** requirements for Indian businesses.

## ✨ Features

- 💳 **UPI Deep Link Payments** - Works with all UPI apps (Google Pay, PhonePe, Paytm)
- 🧾 **Automatic GST Calculation** - 18% GST included by default
- 📄 **GST-Compliant Invoice Generation** - PDF invoices with all required details
- 📧 **Email Automation** - Invoices sent automatically to customers and merchant
- 🔒 **No KYC Required** - Start accepting payments immediately
- 📱 **QR Code Generation** - Easy payment scanning
- 💾 **SQLite Database** - All transactions stored locally
- 🎨 **Modern UI** - Beautiful React frontend

## 🏗️ System Architecture

```
Frontend (React) → Backend (Node/Express) → Database (SQLite)
     ↓                    ↓                    ↓
Payment Form → UPI Link Generation → Transaction Storage
     ↓                    ↓                    ↓
QR Code Display → PDF Invoice → Email Delivery
```

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
node production_server.js
```

The API will be available at: `http://localhost:8000`

### 4. Start Frontend

```bash
# In the main project directory
npm run dev
```

## 📋 API Endpoints

### Create Payment
```http
POST /api/create-payment
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91 9876543210",
  "product_name": "Power Tiller - Model A",
  "base_amount": 45000,
  "gst_rate": 0.18
}
```

### Confirm Payment
```http
POST /api/confirm-payment
Content-Type: application/json

{
  "transaction_id": "uuid-here",
  "utr": "UTR123456789"
}
```

### Get Transaction
```http
GET /api/transaction/{transaction_id}
```

### Update Settings
```http
POST /api/settings
Content-Type: application/json

{
  "merchant_upi": "business@bank",
  "merchant_name": "Business Name",
  "merchant_gstin": "27ABCDE1234Z5X",
  "merchant_address": "Business Address",
  "merchant_phone": "+91 9876543210",
  "merchant_email": "business@email.com"
}
```

## 💳 Payment Flow

1. **Customer selects product** → Frontend shows payment form
2. **Customer fills details** → Name, email, phone
3. **System calculates GST** → Base amount + 18% GST
4. **UPI link generated** → `upi://pay?pa=merchant@bank&am=amount&tn=invoice_id`
5. **QR code displayed** → Customer scans or clicks UPI link
6. **Customer pays** → Using any UPI app
7. **Customer enters UTR** → Transaction ID from payment app
8. **Invoice generated** → PDF with GST details
9. **Email sent** → To customer and merchant

## 🧾 Invoice Format

Each invoice includes:
- ✅ Invoice number and date
- ✅ Customer details
- ✅ Product/service description
- ✅ Base amount and GST breakdown
- ✅ Total amount
- ✅ Payment method (UPI)
- ✅ UTR/Transaction ID
- ✅ Merchant GSTIN (if provided)
- ✅ Professional formatting

## 📧 Email Templates

### Customer Invoice Email
- Subject: "Invoice INV-1001 - Payment Received - Ratan Agri Tech"
- Body: Thank you message with payment details
- Attachment: PDF invoice

### Merchant Notification
- Subject: "New Payment Received - Invoice INV-1001"
- Body: Customer details and payment summary
- Attachment: PDF invoice copy

## 🔧 Configuration

### Gmail Setup (for email sending)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security
3. Generate an "App Password" for this application
4. Use the app password in the `.env` file

### UPI Setup

1. Create a business UPI ID (e.g., `business@axisbank`)
2. Update `MERCHANT_UPI` in `.env` file
3. Test with small amounts first

## 📊 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
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
);
```

## 🚀 Deployment

### Local Development
```bash
node production_server.js
```

### Production Deployment
1. Use a VPS (DigitalOcean, AWS, etc.)
2. Install Python 3.8+
3. Clone the repository
4. Run `python setup.py`
5. Configure `.env` file
6. Use a process manager like PM2 or systemd
7. Set up reverse proxy (Nginx)
8. Configure SSL certificate

### Docker Deployment
```dockerfile
FROM node:18-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend .
EXPOSE 8000
CMD ["node", "production_server.js"]
```

## 🔒 Security Considerations

- ✅ All sensitive data in environment variables
- ✅ SQLite database with proper permissions
- ✅ Input validation on all API endpoints
- ✅ Email credentials secured
- ✅ HTTPS recommended for production

## 🎯 Future Enhancements

- [ ] Webhook integration for automatic payment verification
- [ ] Razorpay/Cashfree integration (with KYC)
- [ ] Admin dashboard for transaction management
- [ ] SMS notifications
- [ ] Multi-currency support
- [ ] Advanced reporting and analytics

## 📞 Support

For support or questions:
- Email: ratanagritech@gmail.com
- Phone: +91 7726017648
- Address: Jagmalpura, Sikar, Rajasthan

## 📄 License

This project is proprietary software for Ratan Agri Tech.

---

**Built with ❤️ for Indian businesses**

