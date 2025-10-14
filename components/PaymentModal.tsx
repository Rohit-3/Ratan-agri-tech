import React from 'react';
import { PaymentModalProps } from '../types';

const PaymentModal: React.FC<PaymentModalProps> = ({ product, siteImages, onClose }) => {
    if (!product) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Complete Your Purchase</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
                </div>
                <div className="p-8 text-center">
                    <p className="text-gray-600 mb-2">You are purchasing:</p>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{product.name}</h3>
                    
                    {product.price && (
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-green-600">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg">
                         <h4 className="text-lg font-bold text-gray-800 mb-3">Scan to Pay with UPI</h4>
                         <img src={siteImages.qrCode} alt="Payment QR Code" className="w-56 h-56 object-contain rounded-lg shadow-md border" />
                         <p className="text-gray-600 mt-3 text-sm">Use any UPI app like Google Pay, PhonePe, or Paytm.</p>
                    </div>

                    <p className="text-xs text-gray-500 mt-6">
                        After payment, please contact us at <a href={`tel:${'7726017648'}`} className="text-green-600 font-semibold hover:underline">7726017648</a> with your transaction details to confirm your order.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-b-lg text-right">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-white border border-black text-black font-extrabold py-2 px-6 rounded-lg transition duration-300 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
