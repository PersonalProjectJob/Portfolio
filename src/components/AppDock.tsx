import React from 'react';
import { useAppStore, type AppName } from '../store';

const APPS: { id: AppName; label: string; shortcut: string }[] = [
  { id: 'figma', label: 'QUEST: CASE_STUDIES', shortcut: 'F1' },
  { id: 'photoshop', label: 'SYS: VISUALS', shortcut: 'F2' },
  { id: 'illustrator', label: 'DB: SKILL_TREE', shortcut: 'F3' },
  { id: 'gemini', label: 'AI: ORACLE', shortcut: 'F4' },
];

export const AppDock: React.FC = () => {
  const { openApp, setOpenApp } = useAppStore();

  return (
    <div className="relative z-10 w-full mt-24 flex justify-center pb-8 px-4">
      
      {/* Cyberpunk Bar */}
      <div className="w-full max-w-4xl cyber-panel flex items-center justify-between p-2">
        
        {/* Left Deco */}
        <div className="flex items-center space-x-2 px-4 border-r border-amber-500/30">
          <div className="w-2 h-4 bg-amber-500 animate-pulse" />
          <span className="text-[10px] text-amber-500/50">SYS.DOCK</span>
        </div>

        {/* Modules */}
        <div className="flex flex-1 items-center justify-center space-x-2 md:space-x-4 px-4 overflow-x-auto custom-scrollbar">
          {APPS.map((app) => {
            const isActive = openApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setOpenApp(app.id)}
                className={`relative px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap cyber-button ${isActive ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}`}
              >
                <span className="opacity-50 mr-2">[{app.shortcut}]</span>
                {app.label}
              </button>
            );
          })}
        </div>

        {/* Right Deco */}
        <div className="flex items-center space-x-1 px-4 border-l border-amber-500/30">
          <div className="w-1 h-3 bg-amber-500/30" />
          <div className="w-1 h-3 bg-amber-500/30" />
          <div className="w-1 h-3 bg-amber-500/30" />
        </div>

      </div>
    </div>
  );
};
