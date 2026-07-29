import React from 'react';
import { motion } from 'framer-motion';

const LayersIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const CodeIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const ComponentIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/></svg>;
const BookOpenIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useT } from '../i18n/useT';

export const ProjectHandoff: React.FC = () => {
  const { isLightMode } = useStore();
  const t = useT();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-sky-600' : 'text-sky-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(14,165,233,0.15)]' : 'shadow-[0_0_30px_rgba(14,165,233,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-sky-100/50 via-transparent to-transparent' : 'from-sky-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div>
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-12 md:mb-20 text-center md:text-left">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${isLightMode ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-sky-500/30 bg-sky-500/10 text-sky-300'}`}>{t('handoff.tag')}</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {t('handoff.titlePart1')}<span className="text-sky-500">{t('handoff.titlePart2')}</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl ${theme.textMuted} leading-relaxed mx-auto md:mx-0`}>
            {t('handoff.subtitle')}
          </p>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-24">
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><ComponentIcon/> {t('handoff.system.title')}</h3>
            <ul className={`space-y-4 ${theme.textMuted}`}>
              <li className="flex items-start gap-3"><LayersIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.system.item1.bold')}</strong>{t('handoff.system.item1.text')}</span></li>
              <li className="flex items-start gap-3"><LayersIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.system.item2.bold')}</strong>{t('handoff.system.item2.text')}</span></li>
              <li className="flex items-start gap-3"><LayersIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.system.item3.bold')}</strong>{t('handoff.system.item3.text')}</span></li>
              <li className="flex items-start gap-3"><LayersIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.system.item4.bold')}</strong>{t('handoff.system.item4.text')}</span></li>
            </ul>
          </div>
          
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${isLightMode ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-900/10 border-sky-500/30'} ${theme.glow}`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isLightMode ? 'text-sky-700' : 'text-sky-400'}`}><CodeIcon/> {t('handoff.handoff.title')}</h3>
            <ul className={`space-y-4 ${isLightMode ? 'text-sky-900/70' : 'text-sky-200/70'}`}>
              <li className="flex items-start gap-3"><BookOpenIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.handoff.item1.bold')}</strong>{t('handoff.handoff.item1.text')}</span></li>
              <li className="flex items-start gap-3"><BookOpenIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.handoff.item2.bold')}</strong>{t('handoff.handoff.item2.text')}</span></li>
              <li className="flex items-start gap-3"><BookOpenIcon className="w-5 h-5 shrink-0 mt-0.5" /> <span><strong>{t('handoff.handoff.item3.bold')}</strong>{t('handoff.handoff.item3.text')}</span></li>
            </ul>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <div className={`p-10 md:p-12 rounded-3xl border bg-gradient-to-br ${isLightMode ? 'from-sky-50 to-blue-50 border-sky-100' : 'from-sky-900/20 to-blue-900/20 border-sky-500/20'} ${theme.glow} text-center`}>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">{t('handoff.value.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div>
                <div className={`text-4xl font-black mb-2 ${isLightMode ? 'text-sky-600' : 'text-sky-400'}`}>01</div>
                <p className={`font-bold ${theme.text}`}>{t('handoff.value.item1.title')}</p>
                <p className={`text-sm mt-2 ${theme.textMuted}`}>{t('handoff.value.item1.desc')}</p>
              </div>
              <div>
                <div className={`text-4xl font-black mb-2 ${isLightMode ? 'text-sky-600' : 'text-sky-400'}`}>02</div>
                <p className={`font-bold ${theme.text}`}>{t('handoff.value.item2.title')}</p>
                <p className={`text-sm mt-2 ${theme.textMuted}`}>{t('handoff.value.item2.desc')}</p>
              </div>
              <div>
                <div className={`text-4xl font-black mb-2 ${isLightMode ? 'text-sky-600' : 'text-sky-400'}`}>03</div>
                <p className={`font-bold ${theme.text}`}>{t('handoff.value.item3.title')}</p>
                <p className={`text-sm mt-2 ${theme.textMuted}`}>{t('handoff.value.item3.desc')}</p>
              </div>
              <div>
                <div className={`text-4xl font-black mb-2 ${isLightMode ? 'text-sky-600' : 'text-sky-400'}`}>04</div>
                <p className={`font-bold ${theme.text}`}>{t('handoff.value.item4.title')}</p>
                <p className={`text-sm mt-2 ${theme.textMuted}`}>{t('handoff.value.item4.desc')}</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
