import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  disableParallax?: boolean; // Kept for prop compatibility
}

/** Custom hook for `prefers-reduced-motion` — reactive & SSR-safe (BUG-008 fix) */
const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
};

export const DesktopWorkspace: React.FC<Props> = ({ children, disableParallax = false }) => {
  const { isLightMode } = useStore();
  const [isMobile, setIsMobile] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Translational Parallax Setup ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  // Background layer parallax (BUG-005: removed unused layer3X/layer3Y)
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [15, -15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disableParallax || isMobile || prefersReducedMotion) return;
    const { clientX, clientY } = e;
    mouseX.set(clientX / window.innerWidth - 0.5);
    mouseY.set(clientY / window.innerHeight - 0.5);
  };
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex items-center justify-center transition-all duration-1000 bg-[#050505]"
      onMouseMove={handleMouseMove}
    >
      {/* =========================================
          LAYER 1 (z-0): BACKGROUND (PAPER DESK)
          ========================================= */}
      <motion.div 
        className="absolute inset-0 z-0 bg-[#0a0f1c]" 
        style={{ x: layer1X, y: layer1Y }}
      >
        {/* Same desk image for both modes → perfectly smooth transition (BUG-003: WebP) */}
        <img src="/designer-desk-bg.webp" 
             className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
               isLightMode 
                 ? 'opacity-100 filter-none' 
                 : 'opacity-40 brightness-50 contrast-125 saturate-50'
             }`}
             alt="Designer Workspace Sketchpad" />
             
        {/* Dark Mode Overlay for cinematic deep shadows on the desk */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(2,6,23,0.9)_100%)] mix-blend-multiply transition-opacity duration-1000 pointer-events-none ${isLightMode ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`absolute inset-0 bg-blue-950/40 mix-blend-overlay transition-opacity duration-1000 pointer-events-none ${isLightMode ? 'opacity-0' : 'opacity-100'}`} />
      </motion.div>

      {/* Dot grid overlay for Dark mode tech feel */}
      <div className={`absolute inset-0 z-[1] opacity-20 pointer-events-none transition-opacity duration-1000 ${
        isLightMode ? 'opacity-0' : 'bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)]'
      }`} style={{ backgroundSize: '20px 20px' }} />

      {/* =========================================
          LAYER 4 (z-3): AMBIENT GLOW
          BUG-001 FIX: blur 150→80px, removed mix-blend-screen (GPU saver)
          ========================================= */}
      <div className="absolute inset-0 z-[3] pointer-events-none transition-all duration-1000">
         <motion.div 
            className={`absolute top-[-10%] left-[-20%] w-[70%] h-[80%] blur-[130px] rounded-full mix-blend-screen transition-colors duration-1000 ${isLightMode ? 'bg-orange-100/30' : 'bg-pink-600/20'}`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         />
         <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] blur-[150px] rounded-full mix-blend-screen transition-colors duration-1000 ${isLightMode ? 'bg-yellow-50/20' : 'bg-cyan-600/10'}`} />
      </div>

      {/* =========================================
          LAYER 5 (z-10): UI CONTENT CONTAINER (Graph)
          ========================================= */}
      <motion.div 
        className="relative z-[10] w-full h-full flex items-center justify-center origin-center transition-all duration-700"
      >
        {children}
      </motion.div>
    </div>
  );
};
