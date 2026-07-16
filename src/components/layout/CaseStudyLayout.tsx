import React from 'react';
import { useStore } from '../../store/useStore';
import { CV_PROJECTS } from '../../data/cvData';

interface CaseStudyLayoutProps {
  children: React.ReactNode;
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({ children }) => {
  const { isLightMode, setGameState, handleQuestSelect, selectedQuest } = useStore();

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#050510]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
  };

  // Determine prev/next projects
  const currentIndex = CV_PROJECTS.findIndex(p => p.id === selectedQuest);
  const prevProject = currentIndex > 0 ? CV_PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < CV_PROJECTS.length - 1 ? CV_PROJECTS[currentIndex + 1] : null;

  return (
    <div className={`fixed inset-0 z-[100] w-full h-[100dvh] overflow-y-auto custom-scrollbar ${theme.bg} ${theme.text} font-sans overflow-x-hidden`}>
      {/* Back Button */}
      <div className="fixed top-20 left-4 md:top-28 md:left-8 z-50">
        <button 
          onClick={() => setGameState('PROJECT_JOURNEY')}
          className={`px-4 py-2 rounded-xl backdrop-blur-md border flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-all ${isLightMode ? 'bg-white/80 border-slate-300 text-orange-600 hover:bg-white' : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-orange-500 hover:shadow-[0_0_15px_rgba(13,148,136,0.5)]'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pb-32">
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
              className={`group px-5 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
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
              className={`group px-5 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
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
            <span className="font-bold tracking-widest uppercase text-[10px]">Contact Me</span>
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
