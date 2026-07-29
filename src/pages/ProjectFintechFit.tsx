import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';
import { useT } from '../i18n/useT';

const ClockIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export const ProjectFintechFit: React.FC = () => {
  const { isLightMode } = useStore();
  const t = useT();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-amber-600' : 'text-amber-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-amber-100/50 via-transparent to-transparent' : 'from-amber-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center pt-10 pb-24">
        <motion.section initial="hidden" animate="visible" variants={fadeInUp}>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border ${isLightMode ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
            <ClockIcon className="w-4 h-4" /> Coming Soon
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {t('fintechFit.titlePart1')}<span className="text-amber-500">{t('fintechFit.titlePart2')}</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${theme.textMuted} mb-12`}>
            {t('fintechFit.subtitle')}
            <br/><br/>
            {t('comingSoon.fintechFit')}
          </p>

          <div className="mb-16 relative">
            <div className={`absolute inset-0 bg-amber-500 rounded-3xl blur-3xl opacity-20`}></div>
            <ZoomableImage 
              src="/images/case-study/fintech_cs_2.jpg" 
              alt="Fintech Blueprint - Coming Soon" 
              className="w-full relative z-10 rounded-[2rem] border border-amber-500/20 shadow-2xl object-cover"
            />
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
