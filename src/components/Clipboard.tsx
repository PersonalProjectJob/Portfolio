import React from 'react';
import { motion } from 'framer-motion';

interface ClipboardProps {
  className?: string;
  delay?: number;
  rotation?: number;
  onClick?: () => void;
}

export const Clipboard: React.FC<ClipboardProps> = ({ 
  className = '',
  delay = 0,
  rotation = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      whileHover={{ scale: 1.05, rotate: rotation - 2, zIndex: 30, transition: { type: 'tween', duration: 0.2 } }}
      transition={{ duration: 0.6, delay, type: 'spring' }}
      onClick={onClick}
      className={`absolute w-36 h-48 md:w-44 md:h-56 bg-amber-100 border-2 border-amber-800/20 rounded-md shadow-lg flex flex-col items-center pt-2 px-3 pb-3 cursor-pointer pointer-events-auto transform-style-preserve-3d ${className}`}
      style={{
        boxShadow: '2px 8px 20px rgba(0,0,0,0.2), inset 0 0 40px rgba(180, 110, 0, 0.05)',
        willChange: 'transform'
      }}
    >
      {/* Clip at the top */}
      <div className="w-16 h-4 bg-slate-400 rounded-sm shadow-md mb-2 border border-slate-500 relative flex justify-center">
        <div className="w-8 h-2 bg-slate-300 rounded-b-sm absolute bottom-0"></div>
      </div>
      
      {/* Paper inside */}
      <div className="w-full flex-1 bg-white/95 rounded border border-gray-200 shadow-sm p-3 flex flex-col gap-2 relative overflow-hidden">
        {/* Subtle grid lines on paper */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_9px,#e5e7eb_10px)] bg-[size:100%_10px] opacity-30"></div>
        
        <div className="h-2 w-3/4 bg-blue-600/30 rounded-full mt-2 relative z-10"></div>
        <div className="h-2 w-1/2 bg-slate-300/60 rounded-full relative z-10"></div>
        <div className="h-2 w-full bg-slate-300/60 rounded-full relative z-10"></div>
        <div className="h-2 w-5/6 bg-slate-300/60 rounded-full relative z-10"></div>
        
        <div className="mt-auto self-center">
          <span className="text-[10px] md:text-xs font-bold text-slate-700 tracking-wider uppercase border-b-2 border-blue-500 relative z-10">Experience</span>
        </div>
      </div>
      
      <div className="absolute -bottom-2 -right-2 text-2xl drop-shadow-md">💼</div>
    </motion.div>
  );
};
