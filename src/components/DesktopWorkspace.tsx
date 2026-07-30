import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CelestialOverlay } from './CelestialOverlay';

interface Props {
  children: React.ReactNode;
  disableParallax?: boolean; // Kept for prop compatibility
}



export const DesktopWorkspace: React.FC<Props> = ({ children, disableParallax = false }) => {
  const { isLightMode } = useStore();
  const [isMobile, setIsMobile] = React.useState(false);

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
  
  // Landscape (far away) moves more
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  // Room (close) moves slightly
  const layer3X = useTransform(smoothX, [-0.5, 0.5], [5, -5]);
  const layer3Y = useTransform(smoothY, [-0.5, 0.5], [2, -2]);

  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disableParallax || isMobile || prefersReducedMotion) return;
    const { clientX, clientY } = e;
    mouseX.set(clientX / window.innerWidth - 0.5);
    mouseY.set(clientY / window.innerHeight - 0.5);
  };
  
  return (
    <div 
      className={`relative w-full h-screen overflow-hidden flex items-center justify-center transition-all duration-1000 ${isMobile ? (isLightMode ? 'bg-[radial-gradient(ellipse_at_center,_rgba(255,237,213,0.5)_0%,_#050505_100%)]' : 'bg-[radial-gradient(ellipse_at_center,_rgba(219,39,119,0.2)_0%,_#050505_100%)]') : 'bg-[#050505]'}`}
      onMouseMove={handleMouseMove}
    >
      
      {/* =========================================
          LAYER 1 (z-0): OUTSIDE LANDSCAPE (CẦN THƠ)
          ========================================= */}
      {!isMobile && (
        <motion.div 
          className="absolute inset-[-5%] z-0" // Extended inset to prevent edges showing during parallax
          style={{ x: layer1X, y: layer1Y }}
        >
          <img src="/cantho-floating-market.webp" 
               className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 blur-[2px]"
               style={{
                 filter: isLightMode 
                   ? 'brightness(1.1) saturate(1.2)' 
                   : 'brightness(0.15) contrast(1.2) sepia(0.3) hue-rotate(180deg) saturate(0.5)'
               }}
               alt="Chợ Nổi Cái Răng Cần Thơ" />
        </motion.div>
      )}

      {/* =========================================
          LAYER 2 (z-1): CELESTIAL OVERLAY (STARS)
          ========================================= */}
      {/* Chỉ hiện ban đêm, đè lên phong cảnh */}
      {!isMobile && (
        <motion.div 
          className="absolute inset-[-5%] z-[1] mix-blend-screen pointer-events-none"
          style={{ x: layer1X, y: layer1Y }} // Celestial moves with the sky
        >
          <CelestialOverlay isLightMode={isLightMode} isMobile={isMobile} />
        </motion.div>
      )}

      {/* =========================================
          LAYER 3 (z-2): ROOM DESK WITH TRANSPARENT WINDOWS
          ========================================= */}
      <motion.div 
        className="absolute inset-[-2%] z-[2] pointer-events-none transition-all duration-1000"
        style={{ x: layer3X, y: layer3Y }}
      >
        {/* The generated transparent room (green screen removed) */}
        <img loading="lazy" decoding="async" src="/workspace-transparent.webp" className="absolute inset-0 w-full h-full object-cover" alt="Workspace Desk" />
        
        {/* Realistic Glass Reflection (Bóng kính) */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-[45deg] translate-x-[-100%] animate-[shimmer_10s_infinite_linear] transition-opacity duration-1000 ${isLightMode ? 'opacity-100' : 'opacity-20'}`} />

        {/* Cinematic Vignette for deeper room shadows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] mix-blend-multiply" />

        {/* Đổ bóng cho phòng khi trời tối */}
        <div className={`absolute inset-0 bg-blue-950/90 mix-blend-multiply transition-opacity duration-[3000ms] ${isLightMode ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-[3000ms] ${isLightMode ? 'opacity-0' : 'opacity-100'}`} />
      </motion.div>

      {/* =========================================
          LAYER 4 (z-3): AMBIENT GLOW
          ========================================= */}
      {!isMobile && (
        <div className="absolute inset-0 z-[3] pointer-events-none transition-all duration-1000">
           <motion.div 
              className={`absolute top-[-10%] left-[-20%] w-[70%] h-[80%] blur-[130px] rounded-full mix-blend-screen transition-colors duration-1000 ${isLightMode ? 'bg-orange-100/30' : 'bg-pink-600/20'}`}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           />
           <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] blur-[150px] rounded-full mix-blend-screen transition-colors duration-1000 ${isLightMode ? 'bg-yellow-50/20' : 'bg-cyan-600/10'}`} />
        </div>
      )}

      {/* =========================================
          LAYER 5 (z-10): UI CONTENT CONTAINER
          ========================================= */}
      <motion.div 
        className="relative z-[10] w-full h-full flex items-center justify-center origin-center transition-all duration-700"
      >
        {children}
      </motion.div>
    </div>
  );
};
