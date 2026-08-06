import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { CV_PROJECTS } from '../data/cvData';
import { trackEvent } from '../utils/analytics';
export const GameCharacterSelect: React.FC = () => {
  const t = useT();
  const { isLightMode, setGameState } = useStore();
  const [isEmailMenuOpen, setIsEmailMenuOpen] = useState(false);
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const emailMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(event.target as Node)) {
        setIsEmailMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('tnsthao94@gmail.com');
      setIsEmailCopied(true);
      trackEvent("contact_click", { contact_method: "email", contact_location: "hero" });
      setTimeout(() => {
        setIsEmailCopied(false);
        setIsEmailMenuOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-start w-full max-w-6xl container-padding shrink-0 pt-6 md:pt-10"
    >
       <div className="w-full flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Left Column: Hero & Contact */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 md:gap-8">
             <div id="portfolio-contact" tabIndex={-1} className={`scroll-mt-28 relative z-20 card-padding flex flex-col items-center text-center rounded-3xl border outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-orange-400 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 mb-6 shadow-2xl bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-400 relative group overflow-hidden">
                   <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      <img loading="lazy" decoding="async" src="/avatar.jpg" alt="Truong Nguyen Son Thao" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   </div>
                   <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                </div>
                
                <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Truong Nguyen Son Thao</h1>
                <h2 className={`text-sm md:text-base font-bold tracking-widest uppercase mb-6 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>{t("profile.role")}</h2>
                
                {/* Contact Links */}
                <div className="flex flex-wrap justify-center gap-3 w-full">
                   <div className="flex-1 min-w-[120px] relative" ref={emailMenuRef}>
                     <button 
                       onClick={() => setIsEmailMenuOpen(!isEmailMenuOpen)}
                       className={`w-full py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 ${isLightMode ? 'bg-white/80 border-slate-300 text-slate-700 hover:shadow-lg hover:border-orange-300 hover:text-orange-600' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:border-orange-500/50 hover:text-orange-400'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t("profile.emailMe")}</span>
                     </button>
                     
                     <AnimatePresence>
                        {isEmailMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute top-full mt-2 left-0 w-56 rounded-xl border p-1 shadow-2xl backdrop-blur-md z-50 ${
                              isLightMode 
                                ? 'bg-white/90 border-slate-200' 
                                : 'bg-[#1e293b]/90 border-white/10'
                            }`}
                          >
                            <div className="flex flex-col">
                              <div className={`px-3 py-2 text-xs font-semibold mb-1 border-b ${isLightMode ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-700/50'}`}>
                                Email: tnsthao94@gmail.com
                              </div>
                              <button
                                onClick={handleCopyEmail}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                  isLightMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-200'
                                }`}
                              >
                                {isEmailCopied ? (
                                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                ) : (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                )}
                                <span className={isEmailCopied ? 'text-green-500 font-medium' : ''}>
                                  {isEmailCopied ? 'Copied!' : 'Copy Email Address'}
                                </span>
                              </button>
                              
                              <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=tnsthao94@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  setIsEmailMenuOpen(false);
                                  trackEvent("contact_click", { contact_method: "email", contact_location: "hero" });
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                  isLightMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-200'
                                }`}
                              >
                                <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4L12 14.01l-3-3"/><path d="M22 4L11 20 7 14 2 11l20-7z"/></svg>
                                Open in Gmail
                              </a>
                              
                              <a
                                href="mailto:tnsthao94@gmail.com"
                                onClick={() => {
                                  setIsEmailMenuOpen(false);
                                  trackEvent("contact_click", { contact_method: "email", contact_location: "hero" });
                                }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                  isLightMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-200'
                                }`}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                Open Default App
                              </a>
                            </div>
                          </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                   <a href="https://www.linkedin.com/in/thaotns" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_click", { contact_method: "linkedin", contact_location: "hero" })} className={`flex-1 min-w-[120px] py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 ${isLightMode ? 'bg-white/80 border-slate-300 text-slate-700 hover:shadow-lg hover:border-orange-300 hover:text-orange-600' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:border-orange-500/50 hover:text-orange-400'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t("profile.linkedin")}</span>
                   </a>
                </div>
             </div>
             
             {/* Quick Stats Card */}
             <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-500 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                       <span className={`text-4xl font-black ${isLightMode ? 'text-orange-600' : 'text-orange-400 drop-shadow-[0_0_10px_rgba(13,148,136,0.5)]'}`}>3+</span>
                       <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t("profile.yearsExp")}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-4xl font-black ${isLightMode ? 'text-amber-600' : 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}>{CV_PROJECTS.length}</span>
                       <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t("profile.keySectors")}</span>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-500/20">
                    <span className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{t("profile.domainExpertise")}</span>
                    <div className="flex flex-wrap gap-2">
                       {['AI', 'Fintech', 'Digital Platforms'].map(tag => (
                          <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLightMode ? 'bg-orange-100 text-orange-700' : 'bg-orange-900/40 text-orange-300 border border-orange-500/30'}`}>{tag}</span>
                       ))}
                    </div>
                 </div>
             </div>
          </div>

          {/* Right Column: About & {t("profile.coreCompetencies")} */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6 md:gap-8">
             {/* About Me Card */}
             <div id="portfolio-about" tabIndex={-1} className={`scroll-mt-28 p-6 md:p-10 rounded-3xl border outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-orange-400 relative overflow-hidden ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <h3 className={`text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                   <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </span>
                   {t("profile.overview")}
                </h3>
                
                <div className={`prose prose-sm md:prose-base max-w-none text-left ${isLightMode ? 'text-slate-700 prose-strong:text-slate-900' : 'text-slate-300 prose-strong:text-white'}`}>
                   <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
                      <span dangerouslySetInnerHTML={{ __html: t("profile.about.p1") }} />
                   </p>
                   <p className="leading-relaxed mb-6">
                      {t("profile.about.p2")}
                   </p>
                   <p className="leading-relaxed border-l-2 border-orange-500 pl-4 py-1 italic opacity-80">
                      {t("profile.about.quote")}
                   </p>
                </div>
             </div>

             {/* Core Competencies */}
             <div className={`card-padding rounded-3xl border transition-all duration-500 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                <h3 className={`text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                   <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   </span>
                   Core Competencies
                </h3>
                
                <div className="flex flex-wrap gap-3">
                   {[t('profile.skill.productThinking'), t('profile.skill.userResearch'), t('profile.skill.collaboration'), t('profile.skill.mvpStrategy'), t('profile.skill.problemSolving')].map(skill => (
                      <div key={skill} className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl flex items-center transition-all hover:scale-105 cursor-default border ${isLightMode ? 'bg-white shadow-sm border-slate-200 text-slate-800' : 'bg-slate-800/50 border-slate-700 text-slate-200 hover:border-orange-500/50 hover:bg-slate-800'}`}>
                         <span className="font-bold text-sm md:text-base">{skill}</span>
                      </div>
                   ))}
                </div>

                {/* Actions: secondary Experience/Playbook shortcuts (hidden at 2xl+, where the scattered desktop UI takes over) + primary View Skills CTA */}
                <div className="mt-10 pt-8 border-t border-slate-500/20 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between 2xl:justify-end">
                   <div className="2xl:hidden flex gap-2">
                      <button onClick={() => setGameState('EXPERIENCE')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${isLightMode ? 'text-slate-600 hover:bg-orange-50 hover:text-orange-600' : 'text-slate-400 hover:bg-slate-800/60 hover:text-orange-400'}`}>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                         {t("profile.experience")}
                      </button>
                      <button onClick={() => setGameState('PROCESS')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${isLightMode ? 'text-slate-600 hover:bg-orange-50 hover:text-orange-600' : 'text-slate-400 hover:bg-slate-800/60 hover:text-orange-400'}`}>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                         {t("profile.playbook")}
                      </button>
                   </div>

                   <button onClick={() => setGameState('SKILL_MATRIX')} className={`w-full md:w-auto px-8 py-4 rounded-xl text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(13,148,136,0.3)] ${isLightMode ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]'}`}>
                      {t("profile.exploreSkills")}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                   </button>
                </div>
             </div>
          </div>

       </div>
    </motion.div>
  );
};
