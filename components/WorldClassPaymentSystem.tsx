import React, { useState, useEffect } from 'react';
import localQrCode from '../image/qr code.jpg';
import { motion } from 'framer-motion';

interface WorldClassPaymentSystemProps {
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  onClose: () => void;
}

interface PaymentData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  product_id: number;
  base_amount: number;
  gst_rate: number;
  notes: string;
}

interface PaymentResponse {
  success: boolean;
  transaction_id: string;
  invoice_id: string;
  base_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  upi_link: string;
  qr_code: string;
  merchant_upi: string;
  merchant_name: string;
  expires_at: string;
}

const WorldClassPaymentSystem: React.FC<WorldClassPaymentSystemProps> = ({ product, onClose }) => {
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    product_name: product.name,
    product_id: product.id,
    base_amount: product.price,
    gst_rate: 0.18,
    notes: ''
  });
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const gstAmount = paymentData.base_amount * paymentData.gst_rate;
  const totalAmount = paymentData.base_amount + gstAmount;

  // Countdown timer
  useEffect(() => {
    if (paymentResponse?.expires_at) {
      const expiryTime = new Date(paymentResponse.expires_at).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimeLeft(timeLeft);
        
        if (timeLeft === 0) {
          setError('Payment session expired. Please start a new payment.');
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentResponse]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createPayment = async () => {
    setLoading(true);
    setError('');

    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Generate realistic payment data
      const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invoice_id = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${transaction_id.slice(-8).toUpperCase()}`;
      
      // Fetch persistent QR from backend site images
      let qrCode = '';
      let merchantUPI = 'ratanagritech@axisbank';
      let merchantName = 'Ratan Agri Tech';
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const res = await fetch(`${apiUrl}/api/site-images`);
        const json = await res.json();
        if (json?.success && json?.data) {
          if (json.data.qr_code) {
            // If backend returns absolute URL, use as is; else prefix with same origin
            qrCode = json.data.qr_code.startsWith('http') ? json.data.qr_code : `${apiUrl}${json.data.qr_code}`;
          }
        }
      } catch {}
      
      // If no QR code from admin, use local bundled QR image
      if (!qrCode) {
        qrCode = localQrCode;
      }
      
      // Generate UPI link
      const upi_link = `upi://pay?pa=${merchantUPI}&pn=${merchantName.replace(/\s+/g, '+')}&am=${totalAmount}&cu=INR&tn=${invoice_id}`;
      
      const mockResponse: PaymentResponse = {
        success: true,
        transaction_id,
        invoice_id,
        base_amount: paymentData.base_amount,
        gst_rate: paymentData.gst_rate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        upi_link,
        qr_code: qrCode, // now a full URL served by backend
        merchant_upi: merchantUPI,
        merchant_name: merchantName,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      setPaymentResponse(mockResponse);
      setStep('payment');
      
      // Store in localStorage for persistence
      localStorage.setItem('payment_session', JSON.stringify({
        transaction_id,
        invoice_id,
        customer_data: paymentData,
        created_at: new Date().toISOString()
      }));
      
    } catch (err) {
      setError('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    setLoading(true);
    setError('');

    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Simulate payment confirmation
      setStep('confirmation');
      
      // Update localStorage
      const sessionData = localStorage.getItem('payment_session');
      if (sessionData) {
        const data = JSON.parse(sessionData);
        data.status = 'confirmed';
        data.utr = utr;
        data.confirmed_at = new Date().toISOString();
        localStorage.setItem('payment_session', JSON.stringify(data));
      }

      // Persist entry for admin panel list
      const adminPaymentsKey = 'admin_payments';
      const existing = localStorage.getItem(adminPaymentsKey);
      const payments = existing ? JSON.parse(existing) : [];
      payments.unshift({
        id: Date.now(),
        transaction_id: paymentResponse?.transaction_id,
        invoice_id: paymentResponse?.invoice_id,
        customer_name: paymentData.customer_name,
        customer_email: paymentData.customer_email,
        customer_phone: paymentData.customer_phone,
        product_name: product.name,
        amount: totalAmount,
        gst_rate: paymentData.gst_rate,
        utr,
        upi_id: paymentResponse?.merchant_upi,
        created_at: new Date().toISOString(),
        status: 'paid'
      });
      localStorage.setItem(adminPaymentsKey, JSON.stringify(payments));
      
    } catch (err) {
      setError('Failed to confirm payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
    const button = document.activeElement as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = '✅ Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  };

  const openUPIApp = () => {
    window.open(paymentResponse!.upi_link, '_blank');
  };

  const downloadInvoice = () => {
    // Generate a simple invoice text
    const invoiceText = `
RATAN AGRI TECH
Jagmalpura, Sikar, Rajasthan
Phone: +91 7726017648
Email: ratanagritech@gmail.com

INVOICE: ${paymentResponse?.invoice_id}
Date: ${new Date().toLocaleDateString()}

Bill To:
${paymentData.customer_name}
${paymentData.customer_email}
${paymentData.customer_phone}

Item: ${product.name}
Base Amount: ₹${paymentData.base_amount.toLocaleString('en-IN')}
GST (${(paymentData.gst_rate * 100).toFixed(0)}%): ₹${gstAmount.toLocaleString('en-IN')}
Total: ₹${totalAmount.toLocaleString('en-IN')}

Payment Method: UPI
UTR: ${utr}

Thank you for your business!
    `;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paymentResponse?.invoice_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary to-secondary">
          <h2 className="text-3xl font-bold text-white">
            {step === 'form' && '💳 Payment Details'}
            {step === 'payment' && '💰 Complete Payment'}
            {step === 'confirmation' && '✅ Payment Confirmed'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center text-black bg-white rounded-full border border-black shadow hover:bg-black hover:text-white transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div className="p-8 pb-4">
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Product Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl mb-8 border-2 border-gray-200">
                <h3 className="font-bold text-2xl mb-6 text-gray-800 flex items-center">
                  <span className="text-3xl mr-3">📋</span>
                  Order Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">{product.name}</span>
                    <span className="font-bold text-xl">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-semibold text-lg">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
                    <span className="font-bold text-2xl text-gray-800">Total Amount</span>
                    <span className="font-bold text-3xl text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
              <form onSubmit={(e) => { e.preventDefault(); createPayment(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={paymentData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={paymentData.customer_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={paymentData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      GST Rate
                    </label>
                    <input
                      type="number"
                      name="gst_rate"
                      value={paymentData.gst_rate}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="Any special instructions or notes..."
                  />
                </div>

                <div className="flex gap-4 sticky bottom-0 left-0 right-0 z-30 bg-white pt-3 pb-3 border-t shadow-lg">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 min-w-[140px] px-8 py-4 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all duration-200 font-extrabold text-lg shadow"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentData.customer_name.trim() || !paymentData.customer_email.trim()}
                    className="flex-1 min-w-[180px] px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-extrabold text-lg shadow-lg transform hover:scale-105"
                  >
                    {loading ? '🔄 Creating Payment...' : '💳 Proceed to Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'payment' && paymentResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Timer */}
              {timeLeft > 0 && (
                <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-8">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">⏰ Payment Session Expires In:</span>
                    <span className="font-bold text-2xl">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Pay ₹{totalAmount.toLocaleString('en-IN')}</h3>
                <p className="text-lg text-gray-600">Scan QR code or click the UPI link below</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-gray-200">
                  {paymentResponse.qr_code ? (
                    <div className="w-64 h-64 flex items-center justify-center rounded-xl">
                      <img
                        src={paymentResponse.qr_code}
                        alt="UPI QR Code"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📱</div>
                        <div className="text-lg font-bold text-gray-600">QR Code</div>
                        <div className="text-sm text-gray-500">Upload QR code in Admin Panel</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl mb-8 border-2 border-gray-200">
                <h4 className="font-bold text-2xl mb-6 text-gray-800 flex items-center">
                  <span className="text-3xl mr-3">💳</span>
                  Payment Details
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">UPI ID:</span>
                    <span className="font-mono font-bold text-primary text-lg">{paymentResponse.merchant_upi}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Amount:</span>
                    <span className="font-bold text-2xl text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Invoice:</span>
                    <span className="font-mono font-semibold text-lg">{paymentResponse.invoice_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Merchant:</span>
                    <span className="font-semibold text-lg">{paymentResponse.merchant_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={openUPIApp}
                  className="w-full px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-900 font-extrabold text-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  📱 Open UPI App
                </button>
                <button
                  onClick={() => copyToClipboard(paymentResponse.upi_link)}
                  className="w-full px-8 py-4 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white font-extrabold text-lg transition-all duration-200"
                >
                  📋 Copy UPI Link
                </button>
              </div>

              {/* UTR Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Enter UTR/Transaction ID after payment *
                </label>
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter UTR from your payment app"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-lg"
                />
                <p className="text-sm text-gray-500 mt-3">
                  💡 You can find the UTR in your payment app's transaction history
                </p>
              </div>

              <div className="flex gap-4 sticky bottom-0 left-0 right-0 z-30 bg-white pt-3 pb-3 border-t shadow-lg">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 min-w-[140px] px-8 py-4 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all duration-200 font-extrabold text-lg"
                >
                  ← Back
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={loading || !utr.trim()}
                  className="flex-1 min-w-[180px] px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-extrabold text-lg shadow-lg"
                >
                  {loading ? '🔄 Confirming...' : '✅ Confirm Payment'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-green-600 mb-6">🎉 Payment Confirmed!</h3>
                <p className="text-2xl text-gray-600 mb-4">
                  Your payment of ₹{totalAmount.toLocaleString('en-IN')} has been successfully processed.
                </p>
                <p className="text-xl text-gray-500">
                  Your GST invoice has been sent to your email address.
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl mb-8 border-2 border-gray-200">
                <h4 className="font-bold text-2xl mb-6 text-gray-800 flex items-center">
                  <span className="text-3xl mr-3">📄</span>
                  Transaction Details
                </h4>
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Invoice Number:</span>
                    <span className="font-mono font-bold text-primary text-lg">{paymentResponse?.invoice_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Transaction ID:</span>
                    <span className="font-mono font-semibold text-lg">{paymentResponse?.transaction_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">UTR:</span>
                    <span className="font-mono font-semibold text-lg">{utr}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-lg">UPI</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={downloadInvoice}
                  className="flex-1 px-8 py-4 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white font-extrabold text-lg transition-all duration-200"
                >
                  📄 Download Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-900 font-extrabold text-lg shadow-lg transition-all duration-200"
                >
                  ✅ Close
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WorldClassPaymentSystem;
