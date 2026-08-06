import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CV_PROJECTS } from '../../data/cvData';
import { Clock } from '../Clock';
import { LanguageToggle } from '../LanguageToggle';
import { useT } from '../../i18n/useT';
import { trackEvent } from '../../utils/analytics';

interface CaseStudyLayoutProps {
  children: React.ReactNode;
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({ children }) => {
  const t = useT();
  const { isLightMode, setGameState, handleQuestSelect, selectedQuest, toggleTheme } = useStore();
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
      trackEvent("contact_click", { contact_method: "email", contact_location: "contact_section" });
      setTimeout(() => {
        setIsEmailCopied(false);
        setIsEmailMenuOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#050510]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
  };

  // Determine prev/next projects (with looping)
  const currentIndex = CV_PROJECTS.findIndex(p => p.id === selectedQuest);
  const currentProject = CV_PROJECTS[currentIndex];
  const prevProject = currentIndex >= 0 
    ? CV_PROJECTS[(currentIndex - 1 + CV_PROJECTS.length) % CV_PROJECTS.length] 
    : null;
  const nextProject = currentIndex >= 0 
    ? CV_PROJECTS[(currentIndex + 1) % CV_PROJECTS.length] 
    : null;

  return (
    <div className={`fixed inset-0 z-[100] h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-pt-20 custom-scrollbar ${theme.bg} ${theme.text} font-sans`}>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${isLightMode ? 'border-slate-200/80 bg-slate-50/90' : 'border-white/10 bg-[#050510]/90'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 md:px-12 py-2 gap-4">
          {/* Left: Back to Journey */}
          <button
            type="button"
            aria-label="Back to project journey"
            onClick={() => setGameState('PROJECT_JOURNEY')}
            className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 md:px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${isLightMode ? 'border-slate-300 bg-white/90 text-slate-700 hover:text-orange-600 hover:bg-white focus-visible:ring-offset-slate-50' : 'border-slate-700 bg-slate-900/90 text-slate-300 hover:border-orange-500 hover:text-white focus-visible:ring-offset-[#050510]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span className="hidden sm:inline">{t("ui.back")}</span>
          </button>

          {/* Center: Case Study Title */}
          {currentProject && (
            <div className="hidden md:flex flex-col items-center justify-center flex-1 overflow-hidden px-4">
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>{t('ui.caseStudy')}</span>
              <span className="text-sm font-black tracking-widest uppercase truncate w-full text-center">{t(currentProject.title)}</span>
            </div>
          )}

          {/* Right: Language + Clock & Theme */}
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle />
            <div className={`flex items-center gap-0.5 h-10 md:h-[42px] rounded-lg p-0.5 border transition-all ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700'}`}>
              <div className="h-full">
                <Clock />
              </div>
              <div className={`w-[1px] self-stretch my-1 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />
              <button 
                type="button"
                onClick={toggleTheme}
                aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
                className={`w-9 md:w-[38px] h-full rounded-md flex items-center justify-center cursor-pointer transition-colors ${isLightMode ? 'text-orange-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                title="Toggle Theme"
              >
                {isLightMode ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 md:pt-10 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:px-6 md:px-12 md:pb-32">
        {children}

        {/* CTA Footer */}
        <div className="mt-16 relative z-10">
          <hr className={`border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`} />
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
            {/* Previous Project */}
            <button
              onClick={() => prevProject && handleQuestSelect(prevProject.id)}
              disabled={!prevProject}
              className={`group min-h-[44px] px-5 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
                !prevProject
                  ? 'opacity-30 cursor-not-allowed border-slate-600 text-slate-500'
                  : isLightMode
                    ? 'border-slate-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400'
                    : 'border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(13,148,136,0.3)]'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span className="hidden sm:inline">{prevProject ? t(prevProject.title) : t('ui.previous')}</span>
              <span className="sm:hidden">{t('ui.previous')}</span>
            </button>

            {/* Back to Journey */}
            <button
              onClick={() => setGameState('PROJECT_JOURNEY')}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
                isLightMode
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                  : 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_20px_rgba(13,148,136,0.4)] hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]'
              }`}
            >
              Back to Journey
            </button>

            {/* Next Project */}
            <button
              onClick={() => nextProject && handleQuestSelect(nextProject.id)}
              disabled={!nextProject}
              className={`group min-h-[44px] px-5 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
                !nextProject
                  ? 'opacity-30 cursor-not-allowed border-slate-600 text-slate-500'
                  : isLightMode
                    ? 'border-slate-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400'
                    : 'border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(13,148,136,0.3)]'
              }`}
            >
              <span className="hidden sm:inline">{nextProject ? t(nextProject.title) : t('ui.next')}</span>
              <span className="sm:hidden">{t('ui.next')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Contact Me */}
          <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="font-bold tracking-widest uppercase text-[11px]">{t('ui.contact')}</span>
            <div className="flex items-center gap-4">
              <div className="relative" ref={emailMenuRef}>
                <button
                  onClick={() => setIsEmailMenuOpen(!isEmailMenuOpen)}
                  className={`flex items-center gap-2 font-semibold transition-colors ${isLightMode ? 'text-orange-600 hover:text-orange-700' : 'text-orange-400 hover:text-orange-300'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email
                </button>
                
                <AnimatePresence>
                  {isEmailMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 rounded-xl border p-1 shadow-2xl backdrop-blur-md ${
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
                            trackEvent("contact_click", { contact_method: "email", contact_location: "contact_section" });
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
                            trackEvent("contact_click", { contact_method: "email", contact_location: "contact_section" });
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
              <span className="text-slate-600">•</span>
              <a
                href="https://www.linkedin.com/in/thaotns"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("contact_click", { contact_method: "linkedin", contact_location: "contact_section" })}
                className={`flex items-center gap-2 font-semibold transition-colors ${isLightMode ? 'text-amber-500 hover:text-amber-600' : 'text-amber-400 hover:text-amber-300'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
