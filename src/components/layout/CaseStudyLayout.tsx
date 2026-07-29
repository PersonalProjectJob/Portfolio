import React from 'react';
import { useStore } from '../../store/useStore';
import { CV_PROJECTS } from '../../data/cvData';
import { Clock } from '../Clock';
import { LanguageToggle } from '../LanguageToggle';

interface CaseStudyLayoutProps {
  children: React.ReactNode;
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({ children }) => {
  const { isLightMode, setGameState, handleQuestSelect, selectedQuest, toggleTheme } = useStore();

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#050510]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
  };

  // Determine prev/next projects
  const currentIndex = CV_PROJECTS.findIndex(p => p.id === selectedQuest);
  const currentProject = CV_PROJECTS[currentIndex];
  const prevProject = currentIndex > 0 ? CV_PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < CV_PROJECTS.length - 1 ? CV_PROJECTS[currentIndex + 1] : null;

  return (
    <div className={`fixed inset-0 z-[100] h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-pt-20 custom-scrollbar ${theme.bg} ${theme.text} font-sans`}>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isLightMode ? 'border-slate-200/80 bg-slate-50/90' : 'border-white/10 bg-[#050510]/90'}`}
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
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Center: Case Study Title */}
          {currentProject && (
            <div className="hidden md:flex flex-col items-center justify-center flex-1 overflow-hidden px-4">
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>Case Study</span>
              <span className="text-sm font-black tracking-widest uppercase truncate w-full text-center">{currentProject.title}</span>
            </div>
          )}

          {/* Right: Clock & Theme Toggle */}
          <div className={`flex shrink-0 h-11 items-center overflow-hidden rounded-xl border shadow-sm transition-all ${isLightMode ? 'bg-white/90 border-slate-300' : 'bg-slate-800/90 border-slate-700'}`}>
            <Clock />
            <div className={`w-[1px] h-3/5 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />
            <button 
              type="button"
              onClick={toggleTheme}
              aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              className={`w-11 h-full flex items-center justify-center cursor-pointer transition-colors ${isLightMode ? 'text-orange-600 hover:bg-slate-200/50' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
              title="Toggle Theme"
            >
              {isLightMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            <div className={`w-[1px] h-3/5 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 md:pt-10 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:px-6 md:px-12 md:pb-32">
        {children}

        {/* CTA Footer */}
        <div className="mt-16">
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
              <span className="hidden sm:inline">{prevProject ? prevProject.title : 'Previous'}</span>
              <span className="sm:hidden">Previous</span>
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
              <span className="hidden sm:inline">{nextProject ? nextProject.title : 'Next'}</span>
              <span className="sm:hidden">Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Contact Me */}
          <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="font-bold tracking-widest uppercase text-[11px]">Contact Me</span>
            <div className="flex items-center gap-4">
              <a
                href="mailto:tnsthao94@gmail.com"
                className={`flex items-center gap-2 font-semibold transition-colors ${isLightMode ? 'text-orange-600 hover:text-orange-700' : 'text-orange-400 hover:text-orange-300'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="https://www.linkedin.com/in/thaotns"
                target="_blank"
                rel="noreferrer"
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
