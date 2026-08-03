import React from 'react';
import { useStore } from '../../store/useStore';
import { Clock } from '../Clock';
import { LanguageToggle } from '../LanguageToggle';

interface DesktopHeaderProps {
  className?: string;
  onLogoClick: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = '', onLogoClick }) => {
  const { isLightMode, toggleTheme } = useStore();

  return (
    <div className={`absolute top-2 left-0 w-full px-3 md:top-8 md:px-8 z-50 flex items-center justify-between pointer-events-none transform-style-preserve-3d translate-z-10 h-12 md:h-auto ${className}`}>
      
      {/* Header Brand */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button 
          type="button"
          onClick={onLogoClick}
          aria-label="Return to cover page"
          className="w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center group relative"
          title="Return to Cover Page"
        >
          <img 
            src="/images/logo.png" 
            alt="Logo" 
            className={`w-full h-full object-contain scale-110 group-hover:scale-125 transition-all duration-300 ${isLightMode ? 'drop-shadow-[0_2px_8px_rgba(249,115,22,0.7)]' : 'drop-shadow-[0_0_15px_rgba(249,115,22,0.9)] drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]'}`} 
          />
        </button>
        {/* Hide text on very small screens to ensure layout doesn't break at 360px */}
        <div className="hidden sm:flex flex-col min-w-0 cursor-pointer" onClick={onLogoClick}>
          <span className={`font-black tracking-widest text-xs md:text-base leading-none uppercase drop-shadow-md truncate transition-colors hover:text-orange-500 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Son Thao</span>
          <span className={`hidden md:block text-[11px] font-bold tracking-widest uppercase mt-0.5 ${isLightMode ? 'text-orange-700' : 'text-orange-300'}`}>Interactive Portfolio</span>
        </div>
      </div>

      {/* Language + Clock & Theme */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <LanguageToggle />
        <div className={`flex items-center gap-0.5 rounded-lg p-0.5 border transition-all ${isLightMode ? 'bg-slate-100 border-slate-200 backdrop-blur-md' : 'bg-slate-800/80 border-slate-700 backdrop-blur-md'}`}>
          {/* Digital Clock — hidden on mobile */}
          <div className="hidden md:flex">
            <Clock />
          </div>
          
          {/* Divider — hidden on mobile */}
          <div className={`hidden md:block w-[1px] self-stretch my-1 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />

          {/* Theme Toggle Button */}
          <button 
            type="button"
            onClick={toggleTheme}
            aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            className={`w-9 h-9 md:w-[38px] md:h-[38px] flex items-center justify-center rounded-md cursor-pointer transition-colors ${isLightMode ? 'text-orange-600 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            title="Toggle Day/Night Mode (Manual Override)"
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
  );
};
