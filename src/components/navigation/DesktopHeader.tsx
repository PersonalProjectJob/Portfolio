import React from 'react';
import { useStore } from '../../store/useStore';
import { Clock } from '../Clock';

interface DesktopHeaderProps {
  className?: string;
  onLogoClick: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = '', onLogoClick }) => {
  const { isLightMode, toggleTheme } = useStore();

  return (
    <div className={className}>
      {/* Header Brand (Click to return to Cover Page) */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 md:gap-4 pointer-events-none transform-style-preserve-3d translate-z-10 max-w-[calc(100%-156px)] md:max-w-none">
        <button 
          type="button"
          onClick={onLogoClick}
          aria-label="Return to cover page"
          className={`w-11 h-11 md:w-12 md:h-12 shrink-0 border rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center font-black text-base md:text-xl pointer-events-auto transition-colors ${isLightMode ? 'bg-white/90 backdrop-blur-md border-slate-300 text-slate-950 hover:bg-white' : 'bg-slate-900/90 backdrop-blur-md border-slate-700 text-white hover:bg-slate-800'}`}
          title="Return to Cover Page"
        >
          S
        </button>
        <div className="flex flex-col min-w-0 pointer-events-auto cursor-pointer" onClick={onLogoClick}>
          <span className={`font-black tracking-widest text-[11px] md:text-base leading-none uppercase drop-shadow-md truncate transition-colors hover:text-orange-500 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Son Thao</span>
          <span className={`hidden text-[11px] md:block md:text-[11px] font-bold tracking-widest uppercase mt-0.5 ${isLightMode ? 'text-orange-700' : 'text-orange-300'}`}>Interactive Portfolio</span>
        </div>
      </div>

      {/* Theme Toggle Button & Clock - Unified Pill Design */}
      <div className={`absolute top-4 right-4 md:top-8 md:right-8 z-50 transform-style-preserve-3d translate-z-10 flex h-12 items-center overflow-hidden rounded-xl border shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all pointer-events-auto ${isLightMode ? 'bg-white/90 border-slate-300 backdrop-blur-xl' : 'bg-slate-800/90 border-slate-700 backdrop-blur-xl'}`}>
        {/* Digital Clock */}
        <Clock />
        
        {/* Divider */}
        <div className={`w-[1px] h-3/5 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />

        {/* Theme Toggle Button */}
        <button 
          type="button"
          onClick={toggleTheme}
          aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          className={`w-11 md:w-12 h-full flex items-center justify-center cursor-pointer transition-colors touch-target ${isLightMode ? 'text-orange-600 hover:bg-slate-200/50' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
          title="Toggle Day/Night Mode (Manual Override)"
        >
          {isLightMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-[22px] md:h-[22px]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-[22px] md:h-[22px]"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </button>
      </div>
    </div>
  );
};
