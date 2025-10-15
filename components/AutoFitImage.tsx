import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AutoFitImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
}

const AutoFitImage: React.FC<AutoFitImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  containerClassName = '',
  fallbackIcon 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateFitMode = () => {
    // Always use contain to show the complete image without cropping
    setFitMode('contain');
  };

  useEffect(() => {
    calculateFitMode();
  }, [imageLoaded]);


  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const defaultFallback = (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13l2-2 2 2 2-2 2 2" />
      </svg>
    </div>
  );

  if (imageError) {
    return (
      <div className={`w-full h-full ${containerClassName}`}>
        {fallbackIcon || defaultFallback}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center ${containerClassName}`}
    >
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`max-w-full max-h-full transition-all duration-300 ${className}`}
        style={{
          objectFit: 'contain',
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        width={600}
        height={400}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default AutoFitImage;
