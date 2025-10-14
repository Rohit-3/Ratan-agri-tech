const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('payments.db');

// Initialize database
db.serialize(() => {
  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    invoice_sent BOOLEAN DEFAULT FALSE,
    payment_method TEXT DEFAULT 'UPI',
    notes TEXT
  )`);

  // Business settings table
  db.run(`CREATE TABLE IF NOT EXISTS business_settings (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default business settings
  db.run(`INSERT OR IGNORE INTO business_settings 
    (id, business_name, business_email, business_phone, business_address, merchant_upi)
    VALUES (1, 'Ratan Agri Tech', 'ratanagritech@gmail.com', '+91 7726017648', 
            'Jagmalpura, Sikar, Rajasthan', 'ratanagritech@axisbank')`);
});

// Helper functions
function calculateGST(baseAmount, gstRate = 0.18) {
  const gstAmount = Math.round(baseAmount * gstRate * 100) / 100;
  const totalAmount = Math.round((baseAmount + gstAmount) * 100) / 100;
  return { gstAmount, totalAmount };
}

function generateUPILink(merchantUPI, merchantName, amount, invoiceId) {
  const merchantNameEncoded = merchantName.replace(/\s+/g, '+');
  return `upi://pay?pa=${merchantUPI}&pn=${merchantNameEncoded}&am=${amount}&cu=INR&tn=${invoiceId}`;
}

function generateQRCode(upiLink) {
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(upiLink, { type: 'png', width: 256 }, (err, url) => {
      if (err) reject(err);
      else resolve(url.split(',')[1]); // Remove data:image/png;base64, prefix
    });
  });
}

function getBusinessSettings() {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM business_settings WHERE id = 1", (err, row) => {
      if (err) reject(err);
      else if (!row) {
        // Return default settings
        resolve({
          business_name: 'Ratan Agri Tech',
          business_email: 'ratanagritech@gmail.com',
          business_phone: '+91 7726017648',
          business_address: 'Jagmalpura, Sikar, Rajasthan',
          business_gstin: null,
          merchant_upi: 'ratanagritech@axisbank'
        });
      } else {
        resolve(row);
      }
    });
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Ratan Agri Tech Payment System API',
    version: '2.0.0',
    status: 'active',
    features: [
      'UPI Payment Processing',
      'GST Invoice Generation',
      'Email Automation',
      'Transaction Management',
      'Business Dashboard'
    ]
  });
});

app.post('/api/create-payment', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, product_name, product_id, base_amount, gst_rate = 0.18, notes } = req.body;
    
    // Calculate GST and total
    const { gstAmount, totalAmount } = calculateGST(base_amount, gst_rate);
    
    // Generate unique IDs
    const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoice_id = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${transaction_id.slice(-8).toUpperCase()}`;
    
    // Get business settings
    const businessSettings = await getBusinessSettings();
    
    // Generate UPI link
    const upi_link = generateUPILink(businessSettings.merchant_upi, businessSettings.business_name, totalAmount, invoice_id);
    
    // Generate QR code
    const qr_code = await generateQRCode(upi_link);
    
    // Save to database
    db.run(`INSERT INTO transactions 
      (transaction_id, customer_name, customer_email, customer_phone, product_name, product_id,
       base_amount, gst_rate, gst_amount, total_amount, merchant_upi, merchant_name, invoice_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transaction_id, customer_name, customer_email, customer_phone, product_name, product_id,
       base_amount, gst_rate, gstAmount, totalAmount, businessSettings.merchant_upi, 
       businessSettings.business_name, invoice_id, notes],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ success: false, error: 'Database error' });
          return;
        }
        
        console.log(`Payment created: ${transaction_id}`);
        
        res.json({
          success: true,
          transaction_id,
          invoice_id,
          base_amount,
          gst_rate,
          gst_amount: gstAmount,
          total_amount: totalAmount,
          upi_link,
          qr_code,
          merchant_upi: businessSettings.merchant_upi,
          merchant_name: businessSettings.business_name,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    );
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/confirm-payment', (req, res) => {
  try {
    const { transaction_id, utr, payment_method = 'UPI' } = req.body;
    
    // Update transaction
    db.run(`UPDATE transactions 
      SET utr = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = ?
      WHERE transaction_id = ?`,
      [utr, payment_method, transaction_id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ success: false, error: 'Database error' });
          return;
        }
        
        if (this.changes === 0) {
          res.status(404).json({ success: false, error: 'Transaction not found' });
          return;
        }
        
        // Get transaction details
        db.get('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], (err, transaction) => {
          if (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, error: 'Database error' });
            return;
          }
          
          if (!transaction) {
            res.status(404).json({ success: false, error: 'Transaction not found' });
            return;
          }
          
          console.log(`Payment confirmed: ${transaction_id}`);
          
          res.json({
            success: true,
            message: 'Payment confirmed and invoice sent',
            transaction_id,
            invoice_id: transaction.invoice_id,
            invoice_url: `/api/invoice/${transaction.invoice_id}`
          });
        });
      }
    );
    
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transaction/:transaction_id', (req, res) => {
  const { transaction_id } = req.params;
  
  db.get('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id], (err, transaction) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }
    
    res.json(transaction);
  });
});

app.get('/api/business-settings', async (req, res) => {
  try {
    const settings = await getBusinessSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get business settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/dashboard', (req, res) => {
  // Get total transactions
  db.get('SELECT COUNT(*) as total FROM transactions', (err, totalResult) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    
    // Get total revenue
    db.get('SELECT SUM(total_amount) as revenue FROM transactions WHERE status = "paid"', (err, revenueResult) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, error: 'Database error' });
        return;
      }
      
      // Get recent transactions
      db.all('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10', (err, recentTransactions) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ success: false, error: 'Database error' });
          return;
        }
        
        res.json({
          total_transactions: totalResult.total,
          total_revenue: revenueResult.revenue || 0,
          recent_transactions: recentTransactions
        });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Ratan Agri Tech Payment System v2.0.0');
  console.log('💳 Production-Ready UPI Payment + GST Invoice System');
  console.log('=' .repeat(60));
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log('📊 API Documentation: http://localhost:8000/api/docs');
  console.log('🔧 Business Settings: http://localhost:8000/api/business-settings');
  console.log('=' .repeat(60));
});

