import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCardProps } from '../types';
import WorldClassPaymentSystem from './WorldClassPaymentSystem';

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const [showPayment, setShowPayment] = useState(false);

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  return (
    <>
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group relative h-[320px] w-[340px] mx-auto"
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
        {product.image ? (
          <motion.img 
            src={product.image} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13l2-2 2 2 2-2 2 2" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 flex-grow flex flex-col relative z-10">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 mb-1 truncate">
          {product.name}
        </h3>
        {product.price && (
          <p className="text-xl font-bold text-primary mb-2">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        )}
        {/* Show only first spec */}
        {product.specifications && (
          <p className="text-xs text-gray-500 mb-2 truncate">
            {Object.entries(product.specifications)[0]?.[0]}: {Object.entries(product.specifications)[0]?.[1]}
          </p>
        )}
        <motion.button 
          onClick={handleBuyNow}
          className="mt-auto w-full bg-black text-white font-extrabold py-3 px-6 rounded-lg hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          💳 Buy Now
        </motion.button>
      </div>
      {/* Category Badge */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium text-primary shadow">
        {product.category}
      </div>
    </motion.div>

    {showPayment && (
      <WorldClassPaymentSystem
        product={product}
        onClose={() => setShowPayment(false)}
      />
    )}
    </>
  );
};

export default ProductCard;