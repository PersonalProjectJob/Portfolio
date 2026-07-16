import React from 'react';
import { motion } from 'framer-motion';

interface StickyNoteProps {
  content: React.ReactNode;
  color?: 'yellow' | 'pink' | 'blue' | 'green';
  rotation?: number;
  className?: string;
  delay?: number;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ 
  content, 
  color = 'yellow', 
  rotation = 0, 
  className = '',
  delay = 0 
}) => {
  const bgColors = {
    yellow: 'bg-yellow-200 text-yellow-900 border-yellow-300',
    pink: 'bg-pink-200 text-pink-900 border-pink-300',
    blue: 'bg-blue-200 text-blue-900 border-blue-300',
    green: 'bg-amber-200 text-amber-900 border-amber-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ duration: 0.6, delay, type: 'spring' }}
      className={`absolute w-32 md:w-44 p-3 md:p-4 shadow-[4px_8px_15px_rgba(0,0,0,0.3)] border ${bgColors[color]} ${className}`}
      style={{
        borderRadius: '2px 15px 3px 12px',
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', 
        zIndex: 10,
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 30, transition: { type: 'tween', duration: 0.2 } }}
    >
      {/* Tape effect */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 rotate-[-3deg] shadow-sm" style={{ clipPath: 'polygon(0 10%, 100% 0, 95% 90%, 5% 100%)' }} />
      
      <div className="text-sm font-bold leading-relaxed h-full flex flex-col justify-center">
        {content}
      </div>
    </motion.div>
  );
};
