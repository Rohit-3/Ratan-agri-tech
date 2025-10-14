const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ratan Agri Tech Payment System API', 
    status: 'active' 
  });
});

app.post('/api/create-payment', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, product_name, base_amount, gst_rate = 0.18 } = req.body;
    
    // Calculate GST and total
    const gst_amount = base_amount * gst_rate;
    const total_amount = base_amount + gst_amount;
    
    // Mock response for testing
    res.json({
      success: true,
      transaction_id: 'test-' + Date.now(),
      invoice_id: 'INV-TEST-' + Date.now(),
      base_amount: base_amount,
      gst_rate: gst_rate,
      gst_amount: gst_amount,
      total_amount: total_amount,
      upi_link: `upi://pay?pa=ratanagritech@axisbank&pn=Ratan+Agri+Tech&am=${total_amount}&cu=INR&tn=INV-TEST-${Date.now()}`,
      qr_code: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 pixel PNG
      merchant_upi: 'ratanagritech@axisbank',
      merchant_name: 'Ratan Agri Tech'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/confirm-payment', (req, res) => {
  try {
    const { transaction_id, utr } = req.body;
    
    res.json({
      success: true,
      message: 'Payment confirmed (test mode)',
      transaction_id: transaction_id,
      invoice_id: 'INV-TEST-' + Date.now()
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Ratan Agri Tech Payment System running on http://localhost:${PORT}`);
  console.log('📧 UPI Payment + GST Invoice System (Test Mode)');
  console.log('=' .repeat(50));
});

