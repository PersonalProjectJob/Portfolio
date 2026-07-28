import React from 'react';
import { useStore } from '../../store/useStore';
import { NAV_ITEMS, isNavActive } from '../../config/navConfig';
import type { NavItem } from '../../config/navConfig';

/** SVG icons keyed by NavItem.icon */
const NavIcons: Record<NavItem['icon'], React.ReactNode> = {
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  star: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  activity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M2 12h4l3-9 5 18 3-9h5"/>
    </svg>
  ),
};

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className = '' }) => {
  const { gameState, setGameState, isLightMode } = useStore();

  const sideItems = NAV_ITEMS.filter(item => !item.isCenter);
  const centerItem = NAV_ITEMS.find(item => item.isCenter);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`md:hidden fixed bottom-0 left-0 w-full z-50 pointer-events-auto flex flex-col justify-end ${className}`}
      style={{ height: '88px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Glow effect radiating from behind the navbar */}
      <div className={`absolute bottom-0 left-0 w-full h-[60px] transition-all duration-500 ${isLightMode ? 'shadow-[0_-15px_40px_rgba(255,255,255,0.8)]' : 'shadow-[0_-20px_50px_rgba(13,148,136,0.15)]'}`} />

      <div className="relative w-full h-[54px] flex items-center justify-between px-6 z-10">
        
        {/* Background SVG for Cutout curve */}
        <div className="absolute inset-0 flex w-full h-full z-[-1] overflow-hidden pointer-events-none">
          <div className={`flex-1 transition-colors duration-500 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#0b101e]'}`} />
          <div className="w-[96px] h-[54px] relative">
            <svg width="96" height="54" viewBox="0 0 96 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full">
              <path d="M0,0 C16,0 22,38 48,38 C74,38 80,0 96,0 L96,54 L0,54 Z" className={`transition-colors duration-500 ${isLightMode ? 'fill-[#f8fafc]' : 'fill-[#0b101e]'}`} />
              <path d="M0,0 C16,0 22,38 48,38 C74,38 80,0 96,0" stroke={isLightMode ? '#e2e8f0' : 'rgba(13,148,136,0.3)'} strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className={`flex-1 transition-colors duration-500 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#0b101e]'}`} />
          
          {/* Top border glow */}
          <div className={`absolute top-0 left-0 w-[calc(50%-48px)] h-[1px] ${isLightMode ? 'bg-slate-200' : 'bg-orange-500/30'}`} />
          <div className={`absolute top-0 right-0 w-[calc(50%-48px)] h-[1px] ${isLightMode ? 'bg-slate-200' : 'bg-orange-500/30'}`} />
        </div>

        {/* Left Side Item (Profile) */}
        {sideItems[0] && (
          <SideTabButton item={sideItems[0]} gameState={gameState} isLightMode={isLightMode} setGameState={setGameState} />
        )}
        
        {/* Spacer for center cutout */}
        <div className="w-[96px]" />

        {/* Center Button (Skills) */}
        {centerItem && (
          <div className="absolute left-1/2 top-[-22px] -translate-x-1/2 flex flex-col items-center z-20">
            <button
              type="button"
              aria-label={centerItem.label}
              aria-current={isNavActive(centerItem, gameState) ? 'page' : undefined}
              onClick={() => setGameState(centerItem.id)}
              className={`relative w-[56px] h-[56px] rounded-full flex items-center justify-center text-white transition-all duration-500 group ${isNavActive(centerItem, gameState) ? 'scale-105' : 'scale-95 opacity-60 hover:scale-100 hover:opacity-100'}`}
            >
              {/* Animated Outer Glow Ring */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isNavActive(centerItem, gameState) ? (isLightMode ? 'bg-orange-400 blur-md opacity-60' : 'bg-[#ea580c] blur-xl opacity-80') : 'opacity-0 group-hover:opacity-30'}`} />
              
              {/* Button Base */}
              <div className={`relative w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isNavActive(centerItem, gameState) ? (isLightMode ? 'bg-orange-600 border-white' : 'bg-gradient-to-tr from-orange-600 to-orange-500 border-orange-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.3)]') : (isLightMode ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-[#0f172a] border-slate-700 text-slate-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]')}`}>
                <div className={`transition-all duration-500 ${isNavActive(centerItem, gameState) ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`}>
                  {NavIcons[centerItem.icon]}
                </div>
              </div>
            </button>
            <span className={`text-[11px] font-bold mt-1.5 uppercase tracking-wider transition-all duration-500 ${isNavActive(centerItem, gameState) ? (isLightMode ? 'text-orange-700 drop-shadow-[0_0_5px_rgba(13,148,136,0.3)]' : 'text-[#fdba74] drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]') : (isLightMode ? 'text-slate-400 opacity-60' : 'text-slate-600 opacity-50')}`}>{centerItem.label}</span>
          </div>
        )}

        {/* Right Side Item (Journey) */}
        {sideItems[1] && (
          <SideTabButton item={sideItems[1]} gameState={gameState} isLightMode={isLightMode} setGameState={setGameState} />
        )}
      </div>
    </nav>
  );
};

/** Reusable side tab button (Profile / Journey) */
interface SideTabButtonProps {
  item: NavItem;
  gameState: string;
  isLightMode: boolean;
  setGameState: (state: any) => void;
}

const SideTabButton: React.FC<SideTabButtonProps> = ({ item, gameState, isLightMode, setGameState }) => {
  const active = isNavActive(item, gameState as any);

  return (
    <button
      type="button"
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={() => setGameState(item.id)}
      className={`relative flex flex-col items-center justify-center w-[20%] h-full transition-all duration-300 group touch-target ${active ? (isLightMode ? 'text-orange-600' : 'text-[#fdba74]') : (isLightMode ? 'text-slate-400 hover:text-orange-500' : 'text-slate-500 hover:text-slate-200')}`}
    >
      {/* Spotlight Glow */}
      <div className={`absolute bottom-0 w-20 h-20 bg-orange-500/20 blur-xl rounded-full pointer-events-none transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className={`transition-all duration-300 z-10 ${active ? (isLightMode ? 'drop-shadow-[0_0_8px_rgba(13,148,136,0.5)]' : 'drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]') : ''}`}>
        {NavIcons[item.icon]}
      </div>
      <span className="text-[11px] mt-1 font-bold uppercase tracking-wider z-10">{item.label}</span>
      
      {/* Glowing Underline */}
      <div className={`absolute bottom-0 w-8 h-1 bg-orange-500 rounded-t-full shadow-[0_0_10px_rgba(13,148,136,0.8)] transition-all duration-500 ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
    </button>
  );
};
