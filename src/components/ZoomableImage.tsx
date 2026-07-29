import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt = '', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLightMode } = useStore();

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${className} cursor-zoom-in transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg`}
        onClick={() => setIsOpen(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8" onClick={() => setIsOpen(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 ${isLightMode ? 'bg-slate-100/95' : 'bg-slate-950/95'} backdrop-blur-md`}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center cursor-zoom-out"
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-slate-200/20"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              />
              <button
                type="button"
                className={`absolute top-4 right-4 p-2.5 rounded-full ${isLightMode ? 'bg-white text-slate-800 shadow-md hover:bg-slate-100' : 'bg-slate-800 text-slate-200 shadow-md hover:bg-slate-700 hover:text-white'} transition-all z-20`}
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                aria-label="Close image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
