# 🚀 Ratan Agri Tech - Complete Payment System Deployment Guide

## 🎯 What You've Built

A complete **UPI Payment + GST Invoice System** with:
- ✅ **No KYC Required** - Start accepting payments immediately
- ✅ **UPI Deep Links** - Works with all UPI apps
- ✅ **Automatic GST Calculation** - 18% GST included
- ✅ **PDF Invoice Generation** - GST-compliant invoices
- ✅ **Email Automation** - Invoices sent automatically
- ✅ **QR Code Payments** - Easy scanning
- ✅ **Modern UI** - Beautiful React interface

## 📁 Project Structure

```
ratan-agri-tech/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main API server
│   ├── invoice_generator.py # PDF invoice generation
│   ├── email_service.py    # Email automation
│   ├── requirements.txt    # Python dependencies
│   ├── setup.py           # Installation script
│   ├── start.py           # Server startup
│   └── README.md          # Backend documentation
├── components/             # React components
│   ├── PaymentSystem.tsx  # Payment interface
│   ├── ProductCard.tsx    # Updated with payment
│   └── AutoFitImage.tsx   # Image handling
├── dist/                  # Built frontend
└── DEPLOYMENT_GUIDE.md    # This file
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Backend
```bash
cd backend
python setup.py
```

### Step 2: Configure Email
Edit `.env` file:
```env
EMAIL_USERNAME=ratanagritech@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
MERCHANT_UPI=ratanagritech@axisbank
```

### Step 3: Start Backend
```bash
python start.py
```

### Step 4: Start Frontend
```bash
# In main directory
npm run dev
```

## 📧 Gmail Setup (Required for Email)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to Google Account Settings** → Security
3. **Generate App Password**:
   - Click "2-Step Verification"
   - Click "App passwords"
   - Select "Mail" and "Other"
   - Enter "Ratan Agri Tech Payment System"
   - Copy the 16-character password
4. **Update .env file** with the app password

## 💳 UPI Setup

1. **Create Business UPI ID**:
   - Contact your bank (Axis Bank, HDFC, etc.)
   - Get UPI ID like `ratanagritech@axisbank`
2. **Update .env file**:
   ```env
   MERCHANT_UPI=ratanagritech@axisbank
   MERCHANT_NAME=Ratan Agri Tech
   ```

## 🧾 How It Works

### Customer Journey:
1. **Customer clicks "Buy Now"** on any product
2. **Payment form opens** with product details
3. **Customer enters details** (name, email, phone)
4. **System calculates total** (price + 18% GST)
5. **QR code and UPI link displayed**
6. **Customer pays** using any UPI app
7. **Customer enters UTR** (transaction ID)
8. **Invoice generated and emailed** automatically

### Example Payment:
- **Product**: Power Tiller - Model A
- **Base Price**: ₹45,000
- **GST (18%)**: ₹8,100
- **Total**: ₹53,100
- **UPI Link**: `upi://pay?pa=ratanagritech@axisbank&am=53100&tn=INV-20251014-ABC12345`

## 📊 Database & Storage

### SQLite Database (`payments.db`):
- All transactions stored locally
- Customer details and payment history
- Invoice numbers and UTR tracking
- Email delivery status

### Invoice Storage (`invoices/` folder):
- PDF invoices saved locally
- Named by invoice ID (e.g., `INV-20251014-ABC12345.pdf`)
- Emailed to customers and merchant

## 🔧 Configuration Options

### GST Rate:
- Default: 18%
- Configurable per product
- Automatically calculated

### Email Templates:
- Customer invoice email
- Merchant notification
- Payment reminders (optional)

### UPI Settings:
- Merchant UPI ID
- Business name
- GSTIN (optional)

## 🚀 Production Deployment

### Option 1: VPS Deployment
```bash
# On your VPS (Ubuntu/CentOS)
sudo apt update
sudo apt install python3 python3-pip nginx

# Clone your project
git clone your-repo-url
cd ratan-agri-tech/backend

# Install dependencies
python3 setup.py

# Configure environment
nano .env

# Start with PM2
npm install -g pm2
pm2 start "python3 start.py" --name payment-api
pm2 startup
pm2 save
```

### Option 2: Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["python", "start.py"]
```

### Option 3: Cloud Platforms
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Free tier available
- **Heroku**: Easy deployment
- **DigitalOcean**: VPS with one-click apps

## 🔒 Security Checklist

- ✅ **Environment variables** for sensitive data
- ✅ **HTTPS** for production (SSL certificate)
- ✅ **Input validation** on all forms
- ✅ **SQLite permissions** properly set
- ✅ **Email credentials** secured
- ✅ **UPI ID** verified with bank

## 📈 Monitoring & Analytics

### Transaction Tracking:
- All payments logged in database
- Invoice generation status
- Email delivery confirmation
- UTR verification

### Business Insights:
- Daily/weekly/monthly sales
- Customer details and history
- Product popularity
- Payment success rates

## 🎯 Future Upgrades

### Phase 2: Advanced Features
- [ ] **Razorpay Integration** (with KYC)
- [ ] **Cashfree Integration** (with KYC)
- [ ] **Admin Dashboard** for transaction management
- [ ] **SMS Notifications** for payments
- [ ] **Webhook Verification** for automatic payment confirmation

### Phase 3: Business Growth
- [ ] **Multi-currency support**
- [ ] **Advanced reporting**
- [ ] **Customer portal**
- [ ] **Inventory management**
- [ ] **Order tracking**

## 🆘 Troubleshooting

### Common Issues:

**Email not sending:**
- Check Gmail app password
- Verify 2FA is enabled
- Check spam folder

**UPI link not working:**
- Verify UPI ID format
- Test with small amount first
- Check bank UPI status

**PDF generation fails:**
- Check `invoices/` folder permissions
- Verify ReportLab installation
- Check disk space

**Database errors:**
- Check SQLite file permissions
- Verify database path in .env
- Check disk space

## 📞 Support

**Ratan Agri Tech Support:**
- 📧 Email: ratanagritech@gmail.com
- 📱 Phone: +91 7726017648
- 📍 Address: Jagmalpura, Sikar, Rajasthan

## 🎉 Congratulations!

You now have a **complete payment system** that:
- ✅ Accepts UPI payments without KYC
- ✅ Generates GST-compliant invoices
- ✅ Sends automated emails
- ✅ Works with all UPI apps
- ✅ Stores all transaction data
- ✅ Ready for production use

**Your customers can now pay instantly using Google Pay, PhonePe, Paytm, or any UPI app!**

---

**Built with ❤️ for Ratan Agri Tech - Transforming Agriculture Through Technology**

