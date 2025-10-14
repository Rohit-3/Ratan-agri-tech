import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentSystemProps {
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
  base_amount: number;
  gst_rate: number;
}

const PaymentSystem: React.FC<PaymentSystemProps> = ({ product, onClose }) => {
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    product_name: product.name,
    base_amount: product.price,
    gst_rate: 0.18
  });
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gstAmount = paymentData.base_amount * paymentData.gst_rate;
  const totalAmount = paymentData.base_amount + gstAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('http://localhost:8001/api/create-payment', {
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
        setError('Failed to create payment. Please try again.');
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
      const response = await fetch('http://localhost:8001/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: paymentResponse.transaction_id,
          utr: utr
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('confirmation');
      } else {
        setError('Failed to confirm payment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const openUPIApp = () => {
    window.open(paymentResponse.upi_link, '_blank');
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
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'form' && 'Payment Details'}
            {step === 'payment' && 'Complete Payment'}
            {step === 'confirmation' && 'Payment Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Product Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Customer Form */}
              <form onSubmit={(e) => { e.preventDefault(); createPayment(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={paymentData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={paymentData.customer_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={paymentData.customer_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !paymentData.customer_name.trim() || !paymentData.customer_email.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
                  >
                    {loading ? 'Creating Payment...' : 'Proceed to Payment'}
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
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Pay ₹{totalAmount.toLocaleString('en-IN')}</h3>
                <p className="text-gray-600">Scan QR code or click the UPI link below</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src={`data:image/png;base64,${paymentResponse.qr_code}`} 
                    alt="UPI QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* UPI Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">UPI ID:</span>
                    <span className="font-mono">{paymentResponse.merchant_upi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice:</span>
                    <span className="font-mono">{paymentResponse.invoice_id}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={openUPIApp}
                  className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-secondary font-semibold"
                >
                  Open UPI App
                </button>
                <button
                  onClick={() => copyToClipboard(paymentResponse.upi_link)}
                  className="w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white"
                >
                  Copy UPI Link
                </button>
              </div>

              {/* UTR Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter UTR/Transaction ID after payment *
                </label>
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter UTR from your payment app"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={loading || !utr.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                >
                  {loading ? 'Confirming...' : 'Confirm Payment'}
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
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Your payment of ₹{totalAmount.toLocaleString('en-IN')} has been successfully processed.
                </p>
                <p className="text-sm text-gray-500">
                  Your GST invoice has been sent to your email address.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Invoice Number:</span>
                    <span className="font-mono">{paymentResponse?.invoice_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{paymentResponse?.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UTR:</span>
                    <span className="font-mono">{utr}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSystem;
