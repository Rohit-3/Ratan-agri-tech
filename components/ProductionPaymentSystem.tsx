import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProductionPaymentSystemProps {
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

const ProductionPaymentSystem: React.FC<ProductionPaymentSystemProps> = ({ product, onClose }) => {
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

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentResponse(result);
        setStep('payment');
      } else {
        setError(result.detail || 'Failed to create payment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: paymentResponse!.transaction_id,
          utr: utr,
          payment_method: "UPI"
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('confirmation');
      } else {
        setError(result.detail || 'Failed to confirm payment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
    const button = document.activeElement as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  };

  const openUPIApp = () => {
    window.open(paymentResponse!.upi_link, '_blank');
  };

  const downloadInvoice = () => {
    if (paymentResponse?.invoice_id) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      window.open(`${apiUrl}/api/invoice/${paymentResponse.invoice_id}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary to-secondary">
          <h2 className="text-2xl font-bold text-white">
            {step === 'form' && '💳 Payment Details'}
            {step === 'payment' && '💰 Complete Payment'}
            {step === 'confirmation' && '✅ Payment Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Product Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border">
                <h3 className="font-bold text-xl mb-4 text-gray-800">📋 Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="font-bold text-lg">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-primary">
                    <span className="font-bold text-xl text-gray-800">Total Amount</span>
                    <span className="font-bold text-2xl text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
              <form onSubmit={(e) => { e.preventDefault(); createPayment(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={paymentData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={paymentData.customer_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={paymentData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Any special instructions or notes..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentData.customer_name.trim() || !paymentData.customer_email.trim()}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
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
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">⏰ Payment Session Expires In:</span>
                    <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Pay ₹{totalAmount.toLocaleString('en-IN')}</h3>
                <p className="text-gray-600">Scan QR code or click the UPI link below</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                  <img 
                    src={`data:image/png;base64,${paymentResponse.qr_code}`} 
                    alt="UPI QR Code" 
                    className="w-56 h-56"
                  />
                </div>
              </div>

              {/* UPI Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border">
                <h4 className="font-bold text-lg mb-4 text-gray-800">💳 Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">UPI ID:</span>
                    <span className="font-mono font-bold text-primary">{paymentResponse.merchant_upi}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Amount:</span>
                    <span className="font-bold text-xl text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Invoice:</span>
                    <span className="font-mono font-semibold">{paymentResponse.invoice_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Merchant:</span>
                    <span className="font-semibold">{paymentResponse.merchant_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={openUPIApp}
                  className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-secondary font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  📱 Open UPI App
                </button>
                <button
                  onClick={() => copyToClipboard(paymentResponse.upi_link)}
                  className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white font-semibold transition-all duration-200"
                >
                  📋 Copy UPI Link
                </button>
              </div>

              {/* UTR Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter UTR/Transaction ID after payment *
                </label>
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter UTR from your payment app"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 You can find the UTR in your payment app's transaction history
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={loading || !utr.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
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
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-green-600 mb-4">🎉 Payment Confirmed!</h3>
                <p className="text-xl text-gray-600 mb-2">
                  Your payment of ₹{totalAmount.toLocaleString('en-IN')} has been successfully processed.
                </p>
                <p className="text-lg text-gray-500">
                  Your GST invoice has been sent to your email address.
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border">
                <h4 className="font-bold text-lg mb-4 text-gray-800">📄 Transaction Details</h4>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Invoice Number:</span>
                    <span className="font-mono font-bold text-primary">{paymentResponse?.invoice_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Transaction ID:</span>
                    <span className="font-mono font-semibold">{paymentResponse?.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">UTR:</span>
                    <span className="font-mono font-semibold">{utr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="font-semibold">UPI</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadInvoice}
                  className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white font-semibold transition-all duration-200"
                >
                  📄 Download Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary font-semibold shadow-lg transition-all duration-200"
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

export default ProductionPaymentSystem;

