import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { replaceURL } from './store/useStore';
import type { GameState } from './store/useStore';
import { DesktopWorkspace } from './components/DesktopWorkspace';
import { StickyNote } from './components/StickyNote';
import { FloatingTool } from './components/FloatingTool';
import { Clipboard } from './components/Clipboard';
import { Notebook } from './components/Notebook';
import { HeroIntro } from './components/HeroIntro';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { MobileNavigation } from './components/navigation/MobileNavigation';
import { DesktopHeader } from './components/navigation/DesktopHeader';
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
const ProjectSyncTaskBadge = lazy(() => import('./pages/ProjectSyncTaskBadge'));
const ProjectDispatch = lazy(() => import('./pages/ProjectDispatch').then(m => ({ default: m.ProjectDispatch })));
const ProjectAgentRules = lazy(() => import('./pages/ProjectAgentRules').then(m => ({ default: m.ProjectAgentRules })));

// Route map: GameState → lazy component (HERO_LANDING handled separately)
const ROUTES: Partial<Record<GameState, React.LazyExoticComponent<React.FC>>> = {
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
  CASE_STUDY_SYNCTASKBADGE: ProjectSyncTaskBadge,
  CASE_STUDY_DISPATCH: ProjectDispatch,
  CASE_STUDY_AGENTRULES: ProjectAgentRules,
  EXPERIENCE: GameExperienceTimeline,
  PROCESS: GameDesignProcess,
};

function App() {
  const { gameState, setGameState, isLightMode, syncFromURL } = useStore();
  const isHero = gameState === 'HERO_LANDING';
  const [landingTarget, setLandingTarget] = useState<'about' | 'contact' | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  }, [isLightMode]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [gameState]);

  // Sync state from URL on browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      syncFromURL();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncFromURL]);

  // Replace URL on initial mount (so history entry has correct state)
  useEffect(() => {
    replaceURL(gameState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHero || !landingTarget || gameState !== 'SELECT_PROFILE') return;

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
  }, [isHero, gameState, landingTarget]);

  const handleLandingNavigation = (destination: 'projects' | 'about' | 'services' | 'contact') => {
    setGameState(destination === 'projects' ? 'PROJECT_JOURNEY' : destination === 'services' ? 'PROCESS' : 'SELECT_PROFILE');
    if (destination === 'about' || destination === 'contact') {
      setLandingTarget(destination);
    }
  };

  const CurrentPage = ROUTES[gameState];
  const isCaseStudy = gameState.startsWith('CASE_STUDY_');
  const currentPageContent = CurrentPage ? (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <AnimatePresence mode="wait">
          <CurrentPage key={gameState} />
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  ) : null;

  return (
    <>
    {/* Hero Intro — CEO Level Glassmorphism Landing Page */}
    <AnimatePresence>
      {isHero && <HeroIntro onComplete={() => setGameState('SELECT_PROFILE')} onNavigate={handleLandingNavigation} />}
    </AnimatePresence>

    {isCaseStudy ? (
      <main
        aria-label="Case study"
        className={`fixed inset-0 z-[100] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden ${isLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#050510] text-slate-100'}`}
      >
        {currentPageContent}
      </main>
    ) : (
    <DesktopWorkspace disableParallax={true}>

      {/* Các vật thể nằm rải rác trên bàn — Desktop only */}
      <AnimatePresence>
        {(gameState === 'SKILL_MATRIX' || gameState === 'SELECT_PROFILE') && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none hidden 2xl:block"
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

      {/* Header: Brand + Clock + Theme Toggle */}
      <DesktopHeader onLogoClick={() => setGameState('HERO_LANDING')} />



      {/* Cosmic Navbar — Mobile only (Bottom Tab Bar, Apple HIG compliant) */}
      <MobileNavigation />

      {/* Màn hình chính giữa (Monitor) */}
      <div ref={mainScrollRef} role="main" className="w-full h-[100dvh] flex flex-col items-center justify-start relative z-20 pointer-events-auto overflow-y-auto overflow-x-hidden hide-scrollbar pt-24 px-0 scroll-smooth page-bottom">
        {currentPageContent}
      </div>

    </DesktopWorkspace>
    )}
    </>
  );
}

export default App;
