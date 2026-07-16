import React from 'react';
import { motion } from 'framer-motion';

interface NotebookProps {
  className?: string;
  delay?: number;
  rotation?: number;
  onClick?: () => void;
}

export const Notebook: React.FC<NotebookProps> = ({ 
  className = '',
  delay = 0,
  rotation = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation + 10 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      whileHover={{ scale: 1.05, rotate: rotation + 2, zIndex: 30, transition: { type: 'tween', duration: 0.2 } }}
      transition={{ duration: 0.6, delay, type: 'spring' }}
      onClick={onClick}
      className={`absolute w-32 h-40 md:w-40 md:h-52 bg-[#f4f1e1] rounded-r-lg shadow-[4px_6px_15px_rgba(0,0,0,0.25)] cursor-pointer pointer-events-auto transform-style-preserve-3d ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* Book Binding/Spine (Classic Black Slate) */}
      <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-slate-800 rounded-l-md border-r border-slate-900 shadow-[inset_1px_0_2px_rgba(0,0,0,0.5)]"></div>
      
      {/* Elastic Band (Black Slate) */}
      <div className="absolute top-0 bottom-0 right-4 w-1.5 md:w-2 bg-slate-800 shadow-[2px_0_4px_rgba(0,0,0,0.1)]"></div>
      
      {/* Book Cover Design - Sticker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-1 w-20 h-20 md:w-24 md:h-24 bg-white shadow-sm border border-slate-200 flex flex-col justify-center items-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" className="mb-1">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <div className="w-8 h-[1px] bg-slate-300 my-1"></div>
        <span className="text-slate-800 font-black text-[9px] md:text-[11px] tracking-widest uppercase text-center">Design<br/>Playbook</span>
      </div>
      
      {/* Bookmark */}
      <div className="absolute top-0 right-8 md:right-10 w-3 h-10 bg-orange-600 rounded-b-sm shadow-[1px_2px_3px_rgba(0,0,0,0.2)]"></div>
    </motion.div>
  );
};
