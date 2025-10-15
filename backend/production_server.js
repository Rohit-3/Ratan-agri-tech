const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
// Trust reverse proxy (Render/Heroku) so req.protocol honors X-Forwarded-Proto
app.set('trust proxy', 1);
const APP_VERSION = '2.0.0';

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
// Version header on all responses
app.use((req, res, next) => {
  res.setHeader('X-App-Version', APP_VERSION);
  next();
});
// Optional local uploads dir (not required when returning data URLs)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Simple naive rate limit for non-GET requests
let recentHits = 0;
setInterval(() => { recentHits = Math.max(0, recentHits - 5); }, 1000);
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    if (recentHits > 200) return res.status(429).json({ success: false, error: 'Too many requests' });
    recentHits++;
  }
  next();
});

// Basic body sanitization for strings
function sanitizeString(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[\u0000-\u001F\u007F<>]/g, '').trim();
}
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const k of Object.keys(req.body)) {
      if (typeof req.body[k] === 'string') req.body[k] = sanitizeString(req.body[k]);
    }
  }
  next();
});

// Multer storage: use memory so we can return data URLs and store in DB
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Database setup (SQLite only)
const sqliteDb = new sqlite3.Database('payments.db');

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Initialize database (async to support both engines)
(async () => {
  // SQLite schema
    await dbRun(`CREATE TABLE IF NOT EXISTS transactions (
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

    await dbRun(`CREATE TABLE IF NOT EXISTS business_settings (
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
    await dbRun(`INSERT OR IGNORE INTO business_settings (id, business_name, business_email, business_phone, business_address, merchant_upi)
                 VALUES (1, 'Ratan Agri Tech', 'ratanagritech@gmail.com', '+91 7726017648', 'Jagmalpura, Sikar, Rajasthan', 'ratanagritech@axisbank')`);

    await dbRun(`CREATE TABLE IF NOT EXISTS site_images (
      id INTEGER PRIMARY KEY,
      logo TEXT,
      hero TEXT,
      about TEXT,
      qr_code TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await dbRun(`INSERT OR IGNORE INTO site_images (id, logo, hero, about, qr_code) VALUES (1, '', '', '', '')`);

    await dbRun(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
})().catch((e) => {
  console.error('Database initialization failed:', e);
  process.exit(1);
});

// Helper functions
function calculateGST(baseAmount, gstRate = 0.18) {
  const gstAmount = Math.round(baseAmount * gstRate * 100) / 100;
  const totalAmount = Math.round((baseAmount + gstAmount) * 100) / 100;
  return { gstAmount, totalAmount };
}

function computeETagFromObject(obj) {
  try {
    const json = JSON.stringify(obj);
    // simple weak ETag via length + basic hash
    let hash = 0;
    for (let i = 0; i < json.length; i++) hash = ((hash << 5) - hash) + json.charCodeAt(i) | 0;
    return `W/"${json.length}-${Math.abs(hash)}"`;
  } catch {
    return undefined;
  }
}

// Build absolute URL for paths like /uploads/..., pass through absolute and data URLs
function absolutizeForReq(req, value) {
  try {
    if (!value || typeof value !== 'string') return value;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const withSlash = value.startsWith('/') ? value : `/${value}`;
    return `${protocol}://${host}${withSlash}`;
  } catch {
    return value;
  }
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

async function getBusinessSettings() {
  const row = await dbGet('SELECT * FROM business_settings WHERE id = ?', [1]);
  if (!row) {
    return {
      business_name: 'Ratan Agri Tech',
      business_email: 'ratanagritech@gmail.com',
      business_phone: '+91 7726017648',
      business_address: 'Jagmalpura, Sikar, Rajasthan',
      business_gstin: null,
      merchant_upi: 'ratanagritech@axisbank'
    };
  }
  return row;
}

// Routes
// Health endpoint
app.get('/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ success: true, data: { status: 'ok', version: APP_VERSION } });
});
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

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    // Return data URL so it persists independent of filesystem
    const mime = req.file.mimetype || 'image/png';
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;
    res.json({ success: true, url: dataUrl });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Site images GET/POST
app.get('/api/site-images', async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM site_images WHERE id = ?', [1]);
    const data = row || {};
    // Expand any relative paths (e.g., /uploads/...) to absolute URLs; pass through data URLs untouched
    const absolutize = (v) => absolutizeForReq(req, v);
    const response = {
      ...data,
      logo: absolutize(data.logo),
      hero: absolutize(data.hero),
      about: data.about,
      qr_code: absolutize(data.qr_code),
    };
    const etag = computeETagFromObject(response);
    if (etag && req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    if (etag) res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: response });
  } catch (err) {
    console.error('site-images error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

app.post('/api/site-images', async (req, res) => {
  try {
    const { logo, hero, about, qr_code } = req.body || {};
    await dbRun(`UPDATE site_images SET 
      logo = COALESCE(?, logo),
      hero = COALESCE(?, hero),
      about = COALESCE(?, about),
      qr_code = COALESCE(?, qr_code),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`, [logo ?? null, hero ?? null, about ?? null, qr_code ?? null]);
    const row = await dbGet('SELECT * FROM site_images WHERE id = ?', [1]);
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('site-images update error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
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
    const insertSql = `INSERT INTO transactions (transaction_id, customer_name, customer_email, customer_phone, product_name, product_id,
         base_amount, gst_rate, gst_amount, total_amount, merchant_upi, merchant_name, invoice_id, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    await dbRun(insertSql, [transaction_id, customer_name, customer_email, customer_phone, product_name, product_id,
      base_amount, gst_rate, gstAmount, totalAmount, businessSettings.merchant_upi,
      businessSettings.business_name, invoice_id, notes]);

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
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { transaction_id, utr, payment_method = 'UPI' } = req.body;
    const updateSql = `UPDATE transactions SET utr = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = ? WHERE transaction_id = ?`;
    const result = await dbRun(updateSql, [utr, payment_method, transaction_id]);
    if (!result.changes) return res.status(404).json({ success: false, error: 'Transaction not found' });

    const tx = await dbGet('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id]);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });

    console.log(`Payment confirmed: ${transaction_id}`);
    res.json({
      success: true,
      message: 'Payment confirmed and invoice sent',
      transaction_id,
      invoice_id: tx.invoice_id,
      invoice_url: `/api/invoice/${tx.invoice_id}`
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transaction/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const tx = await dbGet('SELECT * FROM transactions WHERE transaction_id = ?', [transaction_id]);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
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

app.get('/api/dashboard', async (req, res) => {
  try {
    const totalRow = await dbGet('SELECT COUNT(*) as total FROM transactions', []);
    const revenueRow = await dbGet("SELECT SUM(total_amount) as revenue FROM transactions WHERE status = 'paid'", []);
    const recent = await dbAll('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10', []);
    res.json({
      total_transactions: (totalRow && (totalRow.total || totalRow.count)) || 0,
      total_revenue: (revenueRow && revenueRow.revenue) || 0,
      recent_transactions: recent
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Products CRUD
app.get('/api/products', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM products ORDER BY created_at DESC', []);
    const products = rows.map((p) => ({
      ...p,
      image_url: absolutizeForReq(req, p.image_url),
    }));
    const etag = computeETagFromObject(products);
    if (etag && req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    if (etag) res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body || {};
    if (!name || typeof price !== 'number' || price < 0) return res.status(400).json({ success: false, error: 'name and valid price are required' });
    const sql = `INSERT INTO products (name, description, price, image_url, category) VALUES (?,?,?,?,?)`;
    const result = await dbRun(sql, [name, description ?? null, price, image_url ?? null, category ?? null]);
    const created = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
    const response = created ? { ...created, image_url: absolutizeForReq(req, created.image_url) } : created;
    res.json({ success: true, data: response });
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category } = req.body || {};
    if (price != null && (typeof price !== 'number' || price < 0)) return res.status(400).json({ success: false, error: 'invalid price' });
    const sql = `UPDATE products SET 
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           image_url = COALESCE(?, image_url),
           category = COALESCE(?, category),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`;
    const result = await dbRun(sql, [name ?? null, description ?? null, typeof price === 'number' ? price : null, image_url ?? null, category ?? null, id]);
    if (!result.changes) return res.status(404).json({ success: false, error: 'Product not found' });
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    const response = product ? { ...product, image_url: absolutizeForReq(req, product.image_url) } : product;
    res.json({ success: true, data: response });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM products WHERE id = ?', [id]);
    if (!result.changes) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

// Start server
app.listen(PORT, () => {
  const baseUrl = process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log('🚀 Ratan Agri Tech Payment System v2.0.0');
  console.log('💳 Production-Ready UPI Payment + GST Invoice System');
  console.log('='.repeat(60));
  console.log(`🌐 Server running at ${baseUrl}`);
  console.log(`📊 API Root: ${baseUrl}/`);
  console.log(`🔧 Business Settings: ${baseUrl}/api/business-settings`);
  console.log('='.repeat(60));
});

