import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import type { GameState } from './store/useStore';
import { DesktopWorkspace } from './components/DesktopWorkspace';
import { StickyNote } from './components/StickyNote';
import { FloatingTool } from './components/FloatingTool';
import { Clipboard } from './components/Clipboard';
import { Notebook } from './components/Notebook';
import { Clock } from './components/Clock';
import { HeroIntro } from './components/HeroIntro';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import React from 'react';

// Lazy-loaded pages and heavy components
const GameCharacterSelect = lazy(() => import('./components/GameCharacterSelect').then(m => ({ default: m.GameCharacterSelect })));
const GameCharacterStats = lazy(() => import('./components/GameCharacterStats').then(m => ({ default: m.GameCharacterStats })));
const GameWorldMap = lazy(() => import('./components/GameWorldMap').then(m => ({ default: m.GameWorldMap })));
const GameQuestLog = lazy(() => import('./components/GameQuestLog').then(m => ({ default: m.GameQuestLog })));
const GameExperienceTimeline = lazy(() => import('./components/GameExperienceTimeline').then(m => ({ default: m.GameExperienceTimeline })));
const GameDesignProcess = lazy(() => import('./components/GameDesignProcess').then(m => ({ default: m.GameDesignProcess })));
const ProjectCryptomap = lazy(() => import('./pages/ProjectCryptomap').then(m => ({ default: m.ProjectCryptomap })));
const ProjectNailhub = lazy(() => import('./pages/ProjectNailhub').then(m => ({ default: m.ProjectNailhub })));
const ProjectNexora = lazy(() => import('./pages/ProjectNexora').then(m => ({ default: m.ProjectNexora })));
const ProjectVlinkpay = lazy(() => import('./pages/ProjectVlinkpay').then(m => ({ default: m.ProjectVlinkpay })));
const ProjectAIProcess = lazy(() => import('./pages/ProjectAIProcess').then(m => ({ default: m.ProjectAIProcess })));
const ProjectHandoff = lazy(() => import('./pages/ProjectHandoff').then(m => ({ default: m.ProjectHandoff })));
const ProjectFintechFit = lazy(() => import('./pages/ProjectFintechFit').then(m => ({ default: m.ProjectFintechFit })));

// Route map: GameState → lazy component
const ROUTES: Record<GameState, React.LazyExoticComponent<React.FC>> = {
  SELECT_PROFILE: GameCharacterSelect,
  SKILL_MATRIX: GameCharacterStats,
  PROJECT_JOURNEY: GameWorldMap,
  CASE_BRIEF: GameQuestLog,
  CASE_STUDY_CRYPTOMAP: ProjectCryptomap,
  CASE_STUDY_NAILHUB: ProjectNailhub,
  CASE_STUDY_NEXORA: ProjectNexora,
  CASE_STUDY_VLINKPAY: ProjectVlinkpay,
  CASE_STUDY_AIPROCESS: ProjectAIProcess,
  CASE_STUDY_HANDOFF: ProjectHandoff,
  CASE_STUDY_FINTECHFIT: ProjectFintechFit,
  EXPERIENCE: GameExperienceTimeline,
  PROCESS: GameDesignProcess,
};

function App() {
  const { gameState, setGameState, isLightMode, toggleTheme } = useStore();
  const [booted, setBooted] = useState(false);
  const [landingTarget, setLandingTarget] = useState<'about' | 'contact' | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightMode]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [gameState]);

  useEffect(() => {
    if (!booted || !landingTarget || gameState !== 'SELECT_PROFILE') return;

    const targetId = landingTarget === 'about' ? 'portfolio-about' : 'portfolio-contact';
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const target = document.getElementById(targetId);
      if (!target && attempts < 20) return;

      window.clearInterval(timer);
      if (!target) {
        setLandingTarget(null);
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      setLandingTarget(null);
    }, 50);

    return () => window.clearInterval(timer);
  }, [booted, gameState, landingTarget]);

  const handleLandingNavigation = (destination: 'projects' | 'about' | 'services' | 'contact') => {
    if (destination === 'projects') {
      setLandingTarget(null);
      setGameState('PROJECT_JOURNEY');
    } else if (destination === 'services') {
      setLandingTarget(null);
      setGameState('PROCESS');
    } else {
      setLandingTarget(destination);
      setGameState('SELECT_PROFILE');
    }

    setBooted(true);
  };

  const CurrentPage = ROUTES[gameState];

  return (
    <>
    {/* Hero Intro — CEO Level Glassmorphism Landing Page */}
    <AnimatePresence>
      {!booted && <HeroIntro onComplete={() => setBooted(true)} onNavigate={handleLandingNavigation} />}
    </AnimatePresence>

    <DesktopWorkspace disableParallax={true}>

      {/* Các vật thể nằm rải rác trên bàn — Desktop only */}
      <AnimatePresence>
        {(gameState === 'SKILL_MATRIX' || gameState === 'SELECT_PROFILE') && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none hidden md:block"
          >
            <StickyNote 
              className="top-[5%] left-[5%]"
              rotation={-15} 
              color="yellow"
              delay={0.2}
              content={<><span className="text-xl">☕</span><br/>"Less but better."<br/><span className="text-xs text-yellow-700/50">- Dieter Rams</span></>}
            />
            <StickyNote 
              className="bottom-[10%] right-[5%]"
              rotation={8} 
              color="pink"
              delay={0.4}
              content={<><span className="font-bold border-b border-pink-400">TODO:</span><br/>- Review MVP<br/>- Check contrast<br/>- Deploy to Vercel</>}
            />
            <StickyNote 
              className="top-[60%] right-[4%]"
              rotation={22} 
              color="blue"
              delay={0.6}
              content={<>Focus on:<br/><span className="text-blue-700">Micro-interactions</span> ✨</>}
            />
            <FloatingTool 
              label="Figma"
              className="top-[35%] left-[3%]"
              delay={0.3}
              rotation={-10}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>}
            />
            <FloatingTool 
              label="VS Code"
              className="bottom-[5%] left-[30%]"
              delay={0.5}
              rotation={15}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
            />
            <FloatingTool 
              label="React"
              className="top-[40%] right-[3%]"
              delay={0.4}
              rotation={5}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/></svg>}
            />
            <Clipboard 
              className="bottom-[15%] left-[3%] z-50" 
              rotation={-12} 
              delay={0.7}
              onClick={() => setGameState('EXPERIENCE')}
            />
            <Notebook 
              className="top-[10%] right-[3%] z-50" 
              rotation={15} 
              delay={0.8}
              onClick={() => setGameState('PROCESS')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Brand (Click to return to Cover Page) */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 md:gap-4 pointer-events-none transform-style-preserve-3d translate-z-10 max-w-[calc(100%-140px)] md:max-w-none">
         <button 
           onClick={() => setBooted(false)}
           className={`w-8 h-8 md:w-12 md:h-12 shrink-0 border rounded-lg md:rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center font-black text-base md:text-xl pointer-events-auto transition-colors ${isLightMode ? 'bg-white/80 backdrop-blur-md border-slate-300 text-slate-800 hover:bg-white' : 'bg-slate-900/80 backdrop-blur-md border-slate-700 text-slate-200 hover:bg-slate-800'}`}
           title="Return to Cover Page"
         >
           S
         </button>
         <div className="flex flex-col min-w-0 pointer-events-auto cursor-pointer" onClick={() => setBooted(false)}>
            <span className={`font-black tracking-widest text-[11px] md:text-base leading-none uppercase drop-shadow-md truncate transition-colors hover:text-orange-500 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Son Thao</span>
            <span className={`text-[8px] md:text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isLightMode ? 'text-orange-700' : 'text-orange-400'}`}>Interactive Portfolio</span>
         </div>
      </div>

      {/* Theme Toggle Button & Clock - Unified Pill Design */}
      <div className={`absolute top-4 right-4 md:top-8 md:right-8 z-50 transform-style-preserve-3d translate-z-10 flex items-center h-10 md:h-12 rounded-xl border shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all overflow-hidden pointer-events-auto ${isLightMode ? 'bg-white/80 border-slate-300 backdrop-blur-xl' : 'bg-slate-800/80 border-slate-700 backdrop-blur-xl'}`}>
        {/* Digital Clock */}
        <Clock />
        
        {/* Divider */}
        <div className={`w-[1px] h-3/5 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`}></div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className={`w-10 md:w-12 h-full flex items-center justify-center cursor-pointer transition-colors ${isLightMode ? 'text-orange-600 hover:bg-slate-200/50' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
          title="Toggle Day/Night Mode (Manual Override)"
        >
          {isLightMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-[22px] md:h-[22px]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-[22px] md:h-[22px]"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </button>
      </div>

      {/* Cosmic Navbar (Edge-to-edge on Mobile, Hidden on Desktop) */}
      <nav role="navigation" aria-label="Main navigation" className="md:hidden fixed bottom-0 left-0 w-full z-50 pointer-events-auto flex flex-col justify-end h-32">
        {/* Glow effect radiating from behind the navbar (Mobile only) */}
        <div className={`md:hidden absolute bottom-0 left-0 w-full h-[75px] transition-all duration-500 ${isLightMode ? 'shadow-[0_-15px_40px_rgba(255,255,255,0.8)]' : 'shadow-[0_-20px_50px_rgba(13,148,136,0.15)]'}`}></div>

        <div className="relative w-full md:w-auto h-[75px] md:h-[80px] flex items-center justify-between md:justify-center md:gap-8 px-6 md:px-8 z-10">
          
          {/* Background SVG for flawless Cutout curve (Mobile Only) */}
          <div className="md:hidden absolute inset-0 flex w-full h-full z-[-1] overflow-hidden pointer-events-none">
            <div className={`flex-1 transition-colors duration-500 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#0b101e]'}`}></div>
            <div className="w-[110px] h-[75px] relative">
              <svg width="110" height="75" viewBox="0 0 110 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full">
                {/* Bézier curve for perfectly smooth U-shape cutout */}
                <path d="M0,0 C20,0 25,45 55,45 C85,45 90,0 110,0 L110,75 L0,75 Z" className={`transition-colors duration-500 ${isLightMode ? 'fill-[#f8fafc]' : 'fill-[#0b101e]'}`} />
                {/* Top border glow for the curve */}
                <path d="M0,0 C20,0 25,45 55,45 C85,45 90,0 110,0" stroke={isLightMode ? '#e2e8f0' : 'rgba(13,148,136,0.3)'} strokeWidth="1" fill="none" />
              </svg>
            </div>
            <div className={`flex-1 transition-colors duration-500 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#0b101e]'}`}></div>
            
            {/* Top border glow for the straight parts */}
            <div className={`absolute top-0 left-0 w-[calc(50%-55px)] h-[1px] ${isLightMode ? 'bg-slate-200' : 'bg-orange-500/30'}`}></div>
            <div className={`absolute top-0 right-0 w-[calc(50%-55px)] h-[1px] ${isLightMode ? 'bg-slate-200' : 'bg-orange-500/30'}`}></div>
          </div>

          {/* Glassmorphism Pill (Desktop Only) */}
          <div className="hidden md:block absolute inset-0 rounded-3xl border shadow-2xl backdrop-blur-xl z-[-1] pointer-events-none transition-colors duration-500 overflow-hidden" 
               style={{ 
                 background: isLightMode ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
                 borderColor: isLightMode ? 'rgba(255,255,255,0.8)' : 'rgba(13,148,136,0.2)'
               }}>
             {/* Subtle internal glow */}
             <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-20 blur-2xl rounded-full ${isLightMode ? 'bg-orange-300/40' : 'bg-orange-500/20'}`}></div>
          </div>

          {/* Profile Button */}
          <button onClick={() => setGameState('SELECT_PROFILE')} className={`relative flex flex-col items-center justify-center w-[20%] md:w-[70px] h-full transition-all duration-300 group ${gameState === 'SELECT_PROFILE' ? (isLightMode ? 'text-orange-600 md:scale-110' : 'text-[#fdba74] md:scale-110') : (isLightMode ? 'text-slate-400 hover:text-orange-500 md:hover:scale-110' : 'text-slate-500 hover:text-slate-200 md:hover:scale-110')}`}>
             {/* Spotlight Glow */}
             <div className={`absolute bottom-0 w-20 h-20 bg-orange-500/20 blur-xl rounded-full pointer-events-none transition-opacity duration-500 ${gameState === 'SELECT_PROFILE' ? 'opacity-100' : 'opacity-0'}`}></div>
             
             <div className={`transition-all duration-300 z-10 ${gameState === 'SELECT_PROFILE' ? (isLightMode ? 'drop-shadow-[0_0_8px_rgba(13,148,136,0.5)]' : 'drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]') : ''}`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>
             <span className="text-[9px] mt-1.5 font-bold uppercase tracking-[0.2em] z-10">Profile</span>
             
             {/* Glowing Underline */}
             <div className={`absolute bottom-0 w-8 h-1 bg-orange-500 rounded-t-full shadow-[0_0_10px_rgba(13,148,136,0.8)] transition-all duration-500 ${gameState === 'SELECT_PROFILE' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}></div>
          </button>
          
          {/* Spacer (Mobile Only) */}
          <div className="w-[110px] md:hidden"></div>

          {/* Glowing Center Button (Skills) */}
          <div className="absolute md:relative left-1/2 md:left-auto top-[-26px] md:top-auto -translate-x-1/2 md:translate-x-0 flex flex-col items-center z-20">
             <button onClick={() => setGameState('SKILL_MATRIX')} className={`relative w-[64px] h-[64px] rounded-full flex items-center justify-center text-white transition-all duration-500 group ${gameState === 'SKILL_MATRIX' ? 'scale-105 md:scale-110 md:-translate-y-2' : 'scale-95 opacity-60 hover:scale-100 hover:opacity-100 md:hover:-translate-y-2'}`}>
                {/* Animated Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${gameState === 'SKILL_MATRIX' ? (isLightMode ? 'bg-orange-400 blur-md opacity-60' : 'bg-[#ea580c] blur-xl opacity-80') : 'opacity-0 group-hover:opacity-30'}`}></div>
                
                {/* Button Base */}
                <div className={`relative w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-500 ${gameState === 'SKILL_MATRIX' ? (isLightMode ? 'bg-orange-600 border-white' : 'bg-gradient-to-tr from-orange-600 to-orange-500 border-orange-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.3)]') : (isLightMode ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-[#0f172a] border-slate-700 text-slate-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]')}`}>
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-500 ${gameState === 'SKILL_MATRIX' ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
             </button>
             <span className={`text-[9px] font-bold mt-2 uppercase tracking-[0.2em] transition-all duration-500 ${gameState === 'SKILL_MATRIX' ? (isLightMode ? 'text-orange-700 drop-shadow-[0_0_5px_rgba(13,148,136,0.3)]' : 'text-[#fdba74] drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]') : (isLightMode ? 'text-slate-400 opacity-60' : 'text-slate-600 opacity-50')}`}>Skills</span>
          </div>

          {/* Journey Button */}
          <button onClick={() => setGameState('PROJECT_JOURNEY')} className={`relative flex flex-col items-center justify-center w-[20%] md:w-[70px] h-full transition-all duration-300 group ${gameState === 'PROJECT_JOURNEY' || gameState === 'CASE_BRIEF' ? (isLightMode ? 'text-orange-600 md:scale-110' : 'text-[#fdba74] md:scale-110') : (isLightMode ? 'text-slate-400 hover:text-orange-500 md:hover:scale-110' : 'text-slate-500 hover:text-slate-200 md:hover:scale-110')}`}>
             {/* Spotlight Glow */}
             <div className={`absolute bottom-0 w-20 h-20 bg-orange-500/20 blur-xl rounded-full pointer-events-none transition-opacity duration-500 ${gameState === 'PROJECT_JOURNEY' || gameState === 'CASE_BRIEF' ? 'opacity-100' : 'opacity-0'}`}></div>

             <div className={`transition-all duration-300 z-10 ${gameState === 'PROJECT_JOURNEY' || gameState === 'CASE_BRIEF' ? (isLightMode ? 'drop-shadow-[0_0_8px_rgba(13,148,136,0.5)]' : 'drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]') : ''}`}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
             </div>
             <span className="text-[9px] mt-1.5 font-bold uppercase tracking-[0.2em] z-10">Journey</span>
             
             {/* Glowing Underline */}
             <div className={`absolute bottom-0 w-8 h-1 bg-orange-500 rounded-t-full shadow-[0_0_10px_rgba(13,148,136,0.8)] transition-all duration-500 ${gameState === 'PROJECT_JOURNEY' || gameState === 'CASE_BRIEF' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}></div>
          </button>
        </div>
      </nav>

      {/* Màn hình chính giữa (Monitor) */}
      <div ref={mainScrollRef} role="main" className="w-full h-[100dvh] md:h-[100dvh] max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-start md:justify-center relative z-20 pointer-events-auto overflow-y-auto overflow-x-hidden hide-scrollbar pt-28 pb-40 md:pt-24 md:pb-24 px-4 md:px-0 scroll-smooth">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <AnimatePresence mode="wait">
              <CurrentPage key={gameState} />
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>

    </DesktopWorkspace>
    </>
  );
}

export default App;
