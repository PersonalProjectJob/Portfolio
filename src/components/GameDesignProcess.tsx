import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

// processes moved inside component
import { useT } from '../i18n/useT';

export const GameDesignProcess: React.FC = () => {
  const t = useT();
  const { isLightMode, setGameState } = useStore();

  const processes = [
    {
      phase: t('process.1.phase'),
      icon: "🔍",
      desc: t('process.1.desc'),
      details: [
        t('process.1.detail.0'),
        t('process.1.detail.1'),
        t('process.1.detail.2')
      ]
    },
    {
      phase: t('process.2.phase'),
      icon: "🎯",
      desc: t('process.2.desc'),
      details: [
        t('process.2.detail.0'),
        t('process.2.detail.1'),
        t('process.2.detail.2')
      ]
    },
    {
      phase: t('process.3.phase'),
      icon: "✨",
      desc: t('process.3.desc'),
      details: [
        t('process.3.detail.0'),
        t('process.3.detail.1'),
        t('process.3.detail.2')
      ]
    },
    {
      phase: t('process.4.phase'),
      icon: "🚀",
      desc: t('process.4.desc'),
      details: [
        t('process.4.detail.0'),
        t('process.4.detail.1'),
        t('process.4.detail.2')
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`w-full max-w-5xl mx-auto rounded-2xl shadow-xl border backdrop-blur-xl flex flex-col mb-32 ${
        isLightMode 
          ? 'bg-white/95 border-slate-200' 
          : 'bg-[#0f172a]/95 border-slate-700'
      }`}
    >
      {/* Header */}
      <div className={`p-6 border-b flex justify-between items-center ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0b101e]'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isLightMode ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-600'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <div>
            <h2 className={`font-black text-2xl uppercase tracking-widest ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{t('process.title')}</h2>
            <p className={`text-sm font-bold tracking-widest ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('process.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setGameState('SELECT_PROFILE')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
            isLightMode 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {t('process.close')}
        </button>
      </div>

      {/* Grid Content */}
      <div className={`flex-1 p-6 md:p-10 relative ${isLightMode ? 'bg-[linear-gradient(transparent_39px,#e2e8f0_40px),linear-gradient(90deg,transparent_39px,#e2e8f0_40px)]' : 'bg-[linear-gradient(transparent_39px,#1e293b_40px),linear-gradient(90deg,transparent_39px,#1e293b_40px)]'} bg-[size:40px_40px]`}>
        
        {/* Double Diamond SVG Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] md:opacity-[0.05] flex items-center justify-center">
           <svg width="80%" height="80%" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M25 5 L50 25 L25 45 L0 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M75 5 L100 25 L75 45 L50 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
           </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-full relative z-10">
          {processes.map((proc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-6 md:p-8 rounded-xl border transition-colors ${
                isLightMode 
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50' 
                  : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`text-3xl opacity-80 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  {proc.icon}
                </div>
                <div className={`text-4xl font-black ${isLightMode ? 'text-slate-200' : 'text-slate-700/50'}`}>0{index + 1}</div>
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{proc.phase}</h3>
              <p className={`text-xs font-bold uppercase tracking-wider mb-6 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{proc.desc}</p>
              
              <ul className="space-y-3">
                {proc.details.map((detail, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm md:text-base ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    <span className={`mt-1 text-xs ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>•</span>
                    <span className="leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
