import React from 'react';
import { motion } from 'framer-motion';
import { mockProjects } from '../data/mock';
import { Lock, Unlock, ArrowRight } from 'lucide-react';

export const QuestMap: React.FC = () => {
  // Hardcoded positions for the nodes on a virtual map
  const positions = [
    { x: 300, y: 300 },
    { x: 800, y: 400 },
    { x: 1300, y: 250 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0A0A] rounded-xl border border-white/10 rounded-tr-none rounded-tl-none -m-6 w-[calc(100%+48px)] h-[calc(100%+48px)] cursor-grab active:cursor-grabbing">
      
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div 
        drag 
        dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
        dragElastic={0.1}
        className="absolute top-0 left-0 w-[2000px] h-[2000px]"
      >
        {/* Draw lines between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path 
            d={`M ${positions[0].x+100} ${positions[0].y+50} L ${positions[1].x-50} ${positions[1].y+50}`} 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2" 
            strokeDasharray="8 8"
          />
          <path 
            d={`M ${positions[1].x+100} ${positions[1].y+50} L ${positions[2].x-50} ${positions[2].y+50}`} 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="2" 
            strokeDasharray="8 8"
          />
        </svg>

        {/* Render Nodes */}
        {mockProjects.map((p, idx) => {
          const pos = positions[idx] || { x: 100, y: 100 };
          const isUnlocked = idx <= 1; // First two unlocked

          return (
            <motion.div
              key={p.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
              whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
            >
              <div className={`relative flex items-center space-x-4 p-4 rounded-2xl border ${isUnlocked ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-black/40 border-white/5 grayscale'} w-72`}>
                
                {/* Node Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 'bg-zinc-800'}`}>
                  {isUnlocked ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-zinc-500" />}
                </div>

                <div className="flex-1">
                  <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase mb-1">Quest {idx + 1}</p>
                  <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>{p.title}</h3>
                </div>

                {isUnlocked && (
                  <button className="absolute -bottom-4 right-4 bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-zinc-200 flex items-center space-x-1 group">
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Ping Animation for active quest */}
              {idx === 1 && (
                <div className="absolute -inset-4 border border-pink-500/50 rounded-3xl animate-ping opacity-20 pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
