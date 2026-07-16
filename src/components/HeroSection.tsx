import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-20 md:mt-32">
      
      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 flex items-center space-x-2 border border-amber-500/30 bg-black/50 px-4 py-1.5"
      >
        <div className="w-2 h-2 bg-amber-500 animate-pulse" />
        <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">LEVEL 99 DESIGNER / OPERATOR ONLINE</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-6xl md:text-8xl lg:text-[100px] font-bold tracking-tighter leading-[1.05] mb-2 max-w-4xl text-white glitch-text"
        data-text="Hi, I'm Sota."
      >
        Hi, I'm Sota.
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-2xl md:text-4xl lg:text-[40px] font-bold tracking-widest mb-8 text-amber-500/80 uppercase"
      >
        &gt; Systems-Thinking Designer_
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="text-zinc-500 text-[14px] max-w-2xl mx-auto mb-12 leading-relaxed tracking-wider uppercase"
      >
        I don't just draw screens. I architect scalable digital products, complex SaaS platforms, and interactive experiences.
      </motion.p>
      
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="cyber-button px-8 py-4 flex items-center space-x-2 group"
      >
        <span className="font-bold tracking-widest uppercase text-sm">[ INIT CASE_STUDIES ]</span>
      </motion.button>
    </div>
  );
};
