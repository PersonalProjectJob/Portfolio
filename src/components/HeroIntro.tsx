import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '../i18n/useT';

interface HeroIntroProps {
  onComplete: () => void;
  onNavigate: (destination: 'projects' | 'about' | 'services' | 'contact') => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onComplete, onNavigate }) => {
  const t = useT();
  const [bgLoaded, setBgLoaded] = useState(true);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] overflow-hidden bg-slate-950 font-sans"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* LAYER Z-0: Pre-composited Background Image (Image + Text + Portrait) */}
      <div className="absolute inset-0 z-0 bg-black">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/hero-bg.webp" 
          alt="Hero Composite Background" 
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
          onError={(e) => { 
            e.currentTarget.style.display = 'none'; 
            setBgLoaded(false); 
          }}
        />
        {/* Fallback gradient if image fails */}
        {!bgLoaded && <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />}
        {/* Very subtle dimmer overlay to ensure bottom text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
      </div>

      {/* Missing Asset Warning */}
      {!bgLoaded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-4 rounded-xl text-sm border border-red-400 backdrop-blur-md shadow-2xl z-50 flex flex-col items-center text-center pointer-events-auto">
          <span className="text-2xl mb-2">⚠️</span>
          <span className="font-bold mb-1">{t('hero.missingBg')}</span>
          <span className="text-red-200">{t('hero.missingBgDesc')}</span>
        </div>
      )}

      {/* LAYER Z-30: Foreground UI (Nav, Subtitle, Button) */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 pointer-events-none">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center w-full pointer-events-auto">
          <div className="text-white text-xs md:text-sm tracking-[0.2em] font-bold flex flex-row items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 relative flex items-center justify-center shrink-0">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain scale-110 drop-shadow-[0_0_15px_rgba(249,115,22,0.9)] drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] transition-all duration-300" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <span>SON THAO</span> 
              <span className="hidden md:inline text-slate-400 font-normal">|</span>
              <span className="text-slate-400 font-normal text-[11px] md:text-xs uppercase tracking-[0.15em]">{t('hero.role')}</span>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest text-slate-300 items-center">
            <button type="button" onClick={() => onNavigate('projects')} className="hover:text-white transition-colors tracking-widest uppercase">{t('ui.projects')}</button>
            <button type="button" onClick={() => onNavigate('about')} className="hover:text-white transition-colors tracking-widest uppercase">{t('ui.about')}</button>
            <button type="button" onClick={() => onNavigate('services')} className="hover:text-white transition-colors tracking-widest uppercase">{t('ui.services')}</button>
            <button type="button" onClick={() => onNavigate('contact')} className="hover:text-white transition-colors tracking-widest uppercase">{t('ui.contact')}</button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center mb-4 md:mb-8 w-full pointer-events-auto">
          
          <button 
            onClick={onComplete}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-md px-12 py-4 transition-all hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <span className="flex items-center gap-2 text-white font-medium tracking-[0.2em] uppercase text-sm md:text-base">
              {t('hero.enterWork')} 
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>

      </div>

    </motion.div>
  );
};
