import React, { useMemo, useState, useEffect } from 'react';

interface CelestialOverlayProps {
  isLightMode: boolean;
  isMobile?: boolean;
}

export const CelestialOverlay: React.FC<CelestialOverlayProps> = ({ isLightMode, isMobile = false }) => {
  const [sunPos, setSunPos] = useState({ top: 10, left: 50, angle: 0, opacity: 1 });
  const [moonPos, setMoonPos] = useState({ top: 10, left: 50 });
  
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalHours = hours + minutes / 60;
      
      // --- Sun Position (6:00 to 18:00) ---
      let sunX = ((totalHours - 6) / 12) * 100;
      sunX = Math.max(-20, Math.min(120, sunX));
      const nxS = sunX / 100;
      // Parabola: highest at nxS=0.5 (10%), lowest at nxS=0 or 1 (60%)
      const sunY = 50 * Math.pow(2 * (nxS - 0.5), 2) + 10;
      
      // Angle: 6AM = 45deg, 12PM = 0deg, 6PM = -45deg
      const angle = 45 - (sunX / 100) * 90;
      // Opacity: highest at noon (1), lowest at sunrise/sunset (0.2)
      let opacity = 1 - Math.abs(nxS - 0.5) * 1.5;
      opacity = Math.max(0.1, Math.min(1, opacity));

      setSunPos({ top: sunY, left: sunX, angle, opacity });

      // --- Moon Position (18:00 to 6:00) ---
      let moonHours = totalHours;
      if (moonHours < 6) moonHours += 24;
      let moonX = ((moonHours - 18) / 12) * 100;
      moonX = Math.max(-20, Math.min(120, moonX));
      const nxM = moonX / 100;
      const moonY = 50 * Math.pow(2 * (nxM - 0.5), 2) + 10;
      setMoonPos({ top: moonY, left: moonX });
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate random stars once
  const stars = useMemo(() => {
    return Array.from({ length: isMobile ? 15 : 40 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [isMobile]);

  // Generate a few shooting stars
  const shootingStars = useMemo(() => {
    if (isMobile) return [];
    return Array.from({ length: 2 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 30}%`,
      left: `${Math.random() * 50 + 50}%`, // Start from right half
      animationDuration: `${Math.random() * 2 + 6}s`, // Slower interval
      animationDelay: `${Math.random() * 15 + i * 5}s`,
    }));
  }, [isMobile]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden mix-blend-screen"
         style={{
           maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 65%)',
           WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 65%)'
         }}>
      
      {/* Day Sky Elements */}
      <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${isLightMode ? 'opacity-100' : 'opacity-0'}`}>
        {/* Dynamic Volumetric Window Light */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-1000 transform origin-top" 
             style={{ 
               zIndex: 0,
               transform: `rotate(${sunPos.angle}deg)`,
               opacity: sunPos.opacity
             }}>
          {/* Main directional beam */}
          <div className="absolute top-[-20%] left-1/4 right-1/4 h-[150%] bg-gradient-to-b from-white/30 via-yellow-100/10 to-transparent blur-[40px]" />
          
          {/* Secondary softer beam */}
          <div className="absolute top-[-20%] left-1/3 right-1/3 h-[120%] bg-gradient-to-b from-orange-100/20 to-transparent blur-[60px]" />

          {/* Subtle dust motes/shimmering light in the beam */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay opacity-50" />
        </div>
      </div>

      {/* Night Sky Elements */}
      <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${isLightMode ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* The Moon */}
        <div 
          className="absolute rounded-full bg-blue-50 transition-all duration-1000"
          style={{
            top: `${moonPos.top}%`,
            left: `${moonPos.left}%`,
            width: '80px',
            height: '80px',
            boxShadow: '0 0 60px 10px rgba(191, 219, 254, 0.4), inset -15px -15px 20px rgba(0,0,0,0.2)',
            zIndex: 0,
            transform: 'translate(-50%, -50%)'
          }}
        >
           {/* Craters */}
           <div className="absolute top-[20%] left-[30%] w-[15px] h-[15px] rounded-full bg-slate-300/30" />
           <div className="absolute top-[40%] left-[60%] w-[10px] h-[10px] rounded-full bg-slate-300/20" />
           <div className="absolute top-[60%] left-[30%] w-[25px] h-[25px] rounded-full bg-slate-300/30" />
        </div>

        {/* Stars */}
        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="absolute bg-white rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${star.animationDuration} infinite ease-in-out ${star.animationDelay}`,
            }}
          />
        ))}

        {/* Shooting Stars */}
        {shootingStars.map((star) => (
          <div
            key={`shooting-${star.id}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0"
            style={{
              top: star.top,
              left: star.left,
              boxShadow: '0 0 10px 2px rgba(255,255,255,0.4)',
              animation: `shootingStar ${star.animationDuration} infinite linear ${star.animationDelay}`,
            }}
          >
            {/* Trail */}
            <div className="absolute top-1/2 left-1/2 w-[100px] h-[1px] bg-gradient-to-r from-white/80 to-transparent -translate-y-1/2" />
          </div>
        ))}
      </div>

    </div>
  );
};
