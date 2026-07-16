import React from 'react';
import { Hexagon } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10 border-b border-amber-500/20 bg-black/40">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Hexagon className="w-6 h-6 text-amber-500" fill="#10b981" fillOpacity={0.2} />
        <span className="text-amber-500 font-bold text-lg tracking-widest uppercase">SOTA_OS v2.0</span>
      </div>

      {/* Center Pills (Text based) */}
      <div className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest uppercase">
        <button className="text-amber-500">[ ABOUT ]</button>
        <button className="text-zinc-500 hover:text-amber-400 transition-colors">[ PROCESS ]</button>
        <button className="text-zinc-500 hover:text-amber-400 transition-colors">[ RESUME ]</button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button className="cyber-button text-[10px] font-bold px-6 py-2 tracking-widest uppercase">
          INIT_CONTACT
        </button>
      </div>
    </nav>
  );
};
