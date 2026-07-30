import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useT } from '../i18n/useT';

const CreditCardIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const ActivityIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const ShieldCheckIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
const MapPinIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

export const ProjectVlinkpay: React.FC = () => {
  const { isLightMode } = useStore();
  const t = useT();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f111a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    accent: isLightMode ? 'text-orange-600' : 'text-orange-400',
    glow: isLightMode ? 'shadow-glow-orange' : 'shadow-glow-orange-dark'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-orange-100/50 via-transparent to-transparent' : 'from-orange-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div>
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-12 md:mb-20 text-center md:text-left">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${isLightMode ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-orange-500/30 bg-orange-500/10 text-orange-300'}`}>{t('vlinkpay.about.title')}</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {t('vlinkpay.title')} <br className="hidden md:block"/> 
            <span className="text-orange-500">{t('vlinkpay.subtitle')}</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl ${theme.textMuted} leading-relaxed mx-auto md:mx-0`}>
            {t('vlinkpay.about.description')}
          </p>
        </motion.section>

        {/* Challenge Section */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-24">
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><CreditCardIcon/> {t('vlinkpay.challenges.0.title')}</h3>
            <p className={`${theme.textMuted} leading-relaxed mb-4`}>
              {t('vlinkpay.challenges.0.description')}
            </p>
            <p className={`${theme.textMuted} leading-relaxed font-bold`}>
              {t('vlinkpay.hardestChallenge')}
            </p>
            <ul className={`mt-2 space-y-1 text-sm ${theme.textMuted}`}>
              <li>- {t('vlinkpay.challenges.0.solution')}</li>
            </ul>
          </div>
          
          <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl ${theme.card} ${theme.glow}`}>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><ActivityIcon/> {t('vlinkpay.challenges.1.title')}</h3>
            <ul className={`space-y-3 ${theme.textMuted}`}>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold w-4 mt-0.5">•</span> 
                <span>{t('vlinkpay.challenges.1.description')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold w-4 mt-0.5">•</span> 
                <span>{t('vlinkpay.challenges.1.solution')}</span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* The Flow Timeline */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <div className={`p-8 md:p-12 rounded-[2rem] border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10'} ${theme.glow}`}>
            <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-12 text-center md:text-left ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{t('vlinkpay.flow.title')}</h2>
            
            <div className="relative">
              {/* Line background (Desktop Horizontal, Mobile Vertical) */}
              <div className={`absolute left-[23px] top-4 bottom-4 w-[2px] md:w-auto md:h-[2px] md:left-[10%] md:right-[10%] md:top-[23px] ${isLightMode ? 'bg-slate-200' : 'bg-slate-700/50'}`}></div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 ${isLightMode ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'} mb-0 md:mb-6 mr-6 md:mr-0 transition-transform duration-300 group-hover:scale-110`}>
                    <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200 ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"></div>
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700/50'} w-full transition-colors duration-300 group-hover:border-orange-500/30`}>
                    <h4 className={`font-bold text-sm mb-2 ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{t('vlinkpay.flow.step1.title')}</h4>
                    <p className={`text-[13px] leading-relaxed ${theme.textMuted}`}>{t('vlinkpay.flow.step1.desc')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 ${isLightMode ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'} mb-0 md:mb-6 mr-6 md:mr-0 transition-transform duration-300 group-hover:scale-110`}>
                    <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200 ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"></div>
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700/50'} w-full transition-colors duration-300 group-hover:border-orange-500/30`}>
                    <h4 className={`font-bold text-sm mb-2 ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{t('vlinkpay.flow.step2.title')}</h4>
                    <p className={`text-[13px] leading-relaxed ${theme.textMuted}`}>{t('vlinkpay.flow.step2.desc')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 ${isLightMode ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'} mb-0 md:mb-6 mr-6 md:mr-0 transition-transform duration-300 group-hover:scale-110`}>
                    <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-200 ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"></div>
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700/50'} w-full transition-colors duration-300 group-hover:border-orange-500/30`}>
                    <h4 className={`font-bold text-sm mb-2 ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{t('vlinkpay.flow.step3.title')}</h4>
                    <p className={`text-[13px] leading-relaxed ${theme.textMuted}`}>{t('vlinkpay.flow.step3.desc')}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 ${isLightMode ? 'bg-white border-white' : 'bg-slate-900 border-slate-900'} mb-0 md:mb-6 mr-6 md:mr-0 transition-transform duration-300 group-hover:scale-110`}>
                    <div className="w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] ring-4 ring-orange-500/20"></div>
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border ${isLightMode ? 'bg-orange-50 border-orange-200' : 'bg-orange-900/20 border-orange-500/30'} w-full transition-colors duration-300 shadow-sm shadow-orange-500/10 group-hover:border-orange-500/60`}>
                    <h4 className="font-bold text-sm mb-2 text-orange-600 dark:text-orange-400">{t('vlinkpay.flow.step4.title')}</h4>
                    <p className={`text-[13px] leading-relaxed ${theme.textMuted}`}>{t('vlinkpay.flow.step4.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* UX Decisions */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-8">{t('vlinkpay.ux.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${theme.card} hover:-translate-y-2 transition-transform duration-300`}>
              <ShieldCheckIcon />
              <h4 className="font-bold mb-2 mt-4">{t('vlinkpay.features.0.title')}</h4>
              <p className={`text-sm ${theme.textMuted}`}>{t('vlinkpay.features.0.description')}</p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme.card} hover:-translate-y-2 transition-transform duration-300`}>
              <ActivityIcon />
              <h4 className="font-bold mb-2 mt-4">{t('vlinkpay.features.1.title')}</h4>
              <p className={`text-sm ${theme.textMuted}`}>{t('vlinkpay.features.1.description')}</p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme.card} hover:-translate-y-2 transition-transform duration-300`}>
              <MapPinIcon />
              <h4 className="font-bold mb-2 mt-4">{t('vlinkpay.features.2.title')}</h4>
              <p className={`text-sm ${theme.textMuted}`}>{t('vlinkpay.features.2.description')}</p>
            </div>
          </div>
        </motion.section>

        {/* Visual Mockup & Figma Link */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="text-center">
          <div className="flex justify-center mb-8">
              <a
                className={`px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-transform hover:scale-105 ${isLightMode ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-orange-500 text-slate-900 shadow-[0_0_20px_rgba(249,115,22,0.4)]'}`}
                href="https://www.figma.com/design/upTvpWOIHNFC8Vzqf4AJ3f/Program-Hub--Copy-?node-id=52-11225"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('vlinkpay.projectUrlText')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              </a>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-2xl relative group">
            <img loading="lazy" decoding="async" 
              src="/assets/vlinkpay-thumbnail.png" 
              alt={t('vlinkpay.mockup.alt')} 
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 md:p-8">
               <span className="text-white font-bold text-xl drop-shadow-md">{t('vlinkpay.mockup.caption')}</span>
            </div>
          </div>
          
          <div className={`mt-12 p-6 md:p-8 rounded-2xl border-l-4 border-orange-500 text-left max-w-3xl mx-auto ${isLightMode ? 'bg-orange-50/50' : 'bg-orange-900/10'}`}>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-4 text-orange-600 dark:text-orange-400">{t('vlinkpay.conclusion.title')}</h4>
            <p className={`italic ${theme.textMuted} leading-relaxed`} dangerouslySetInnerHTML={{__html: t('vlinkpay.conclusion.description')}}>
            </p>
          </div>
        </motion.section>

      </div>
    </CaseStudyLayout>
  );
};
