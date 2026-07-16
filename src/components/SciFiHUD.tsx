import React, { useEffect, useState } from 'react';

export const SciFiHUD: React.FC = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}:${d.getMilliseconds().toString().padStart(3, '0')}`);
    }, 47);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 font-mono text-[10px] text-zinc-500/40 uppercase tracking-widest">
      {/* Top Right: Timecode */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 text-right">
        <div className="mb-1 text-zinc-400/60">SYS.CLOCK</div>
        <div>{time}</div>
      </div>

      {/* Bottom Left: Status */}
      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-pulse" />
          <span className="text-amber-500/60">OPERATOR.ONLINE</span>
        </div>
        <div className="flex space-x-1 opacity-50">
          <div className="w-4 h-1 bg-white/20" />
          <div className="w-8 h-1 bg-white/20" />
          <div className="w-2 h-1 bg-white/50" />
          <div className="w-12 h-1 bg-white/20" />
          <div className="w-1 h-1 bg-white/80" />
        </div>
      </div>

      {/* Crosshairs & Borders */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/10 hidden md:block" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/10 hidden md:block" />
    </div>
  );
};
