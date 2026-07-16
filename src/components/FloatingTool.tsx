import React from 'react';
import { motion } from 'framer-motion';

interface FloatingToolProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  delay?: number;
  rotation?: number;
}

export const FloatingTool: React.FC<FloatingToolProps> = ({ 
  icon, 
  label, 
  className = '', 
  delay = 0,
  rotation = 0
}) => {
  return (
    <motion.div
      className={`absolute flex items-center justify-center group ${className}`}
      style={{
        zIndex: 5,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 50, rotate: rotation - 20 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.8, delay, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.15, rotate: 0, zIndex: 40, transition: { type: 'tween', duration: 0.2 } }}
    >
      <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-slate-300">
        {icon}
        <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
          {label}
        </div>
      </div>
    </motion.div>
  );
};
