import React from 'react';
import { motion } from 'framer-motion';

const BotIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const UserIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useT } from '../i18n/useT';

export const ProjectAIProcess: React.FC = () => {
  const { isLightMode } = useStore();
  const t = useT();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-amber-600' : 'text-amber-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'shadow-[0_0_30px_rgba(245,158,11,0.1)]'
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

      <div>
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-12 md:mb-20 text-center md:text-left">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${isLightMode ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{t('aiProcess.tag')}</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {t('aiProcess.titlePart1')}<br className="hidden md:block"/> 
            <span className="text-amber-500">{t('aiProcess.titlePart2')}</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl ${theme.textMuted} leading-relaxed mx-auto md:mx-0`}>
            {t('aiProcess.subtitle')}
          </p>
        </motion.section>

        {/* Division of Labor */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-24">
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><BotIcon/> {t('aiProcess.aiBuilder.title')}</h3>
            <ul className={`space-y-4 ${theme.textMuted}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>{t('aiProcess.aiBuilder.item1')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>{t('aiProcess.aiBuilder.item2')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>{t('aiProcess.aiBuilder.item3')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>{t('aiProcess.aiBuilder.item4')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span>{t('aiProcess.aiBuilder.item5')}</span></li>
            </ul>
          </div>
          
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${isLightMode ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-900/10 border-amber-500/30'} ${theme.glow}`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}><UserIcon/> {t('aiProcess.humanDecision.title')}</h3>
            <ul className={`space-y-4 ${isLightMode ? 'text-amber-900/70' : 'text-amber-200/70'}`}>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>{t('aiProcess.humanDecision.item1.bold')}</strong>{t('aiProcess.humanDecision.item1.text')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>{t('aiProcess.humanDecision.item2.bold')}</strong>{t('aiProcess.humanDecision.item2.text')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>{t('aiProcess.humanDecision.item3.bold')}</strong>{t('aiProcess.humanDecision.item3.text')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>{t('aiProcess.humanDecision.item4.bold')}</strong>{t('aiProcess.humanDecision.item4.text')}</span></li>
              <li className="flex items-start gap-3"><CheckCircleIcon /> <span><strong>{t('aiProcess.humanDecision.item5.bold')}</strong>{t('aiProcess.humanDecision.item5.text')}</span></li>
            </ul>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="text-center">
          <blockquote className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight max-w-4xl mx-auto ${theme.text}`}>
            {t('aiProcess.quote.part1')}<br/> 
            <span className="text-amber-500">{t('aiProcess.quote.part2')}</span>
          </blockquote>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
