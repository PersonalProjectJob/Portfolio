import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CV_PROJECTS } from '../data/cvData';
import { useStore } from '../store/useStore';

export const GameWorldMap: React.FC = () => {
  const { isLightMode, setGameState, handleQuestSelect } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [showDragHint, setShowDragHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowDragHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-10 overflow-hidden"
    >
       <div className="absolute top-24 left-10 z-20">
          <button onClick={() => setGameState('SKILL_MATRIX')} className={`premium-button px-6 py-3 text-sm flex items-center gap-2 border transition-all ${isLightMode ? 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50' : 'bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800'}`}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             Back to Profile
          </button>
       </div>

       <div className="absolute top-24 right-10 z-20 text-right pointer-events-none">
          <h2 className={`text-3xl font-extrabold tracking-tight px-4 py-1 rounded-xl backdrop-blur-sm transition-colors ${isLightMode ? 'text-slate-900 bg-white/80' : 'text-slate-100 bg-slate-900/80'}`}>Project Journey</h2>
          <p className={`font-bold tracking-widest mt-2 uppercase text-xs px-4 py-1 rounded-xl inline-block backdrop-blur-sm transition-colors ${isLightMode ? 'text-orange-600 bg-white/80' : 'text-orange-400 bg-slate-900/80'}`}>Explore Case Studies</p>
       </div>

       {/* ====== MOBILE: Vertical Scroll List (<768px) ====== */}
       <div className="md:hidden absolute inset-0 top-40 overflow-y-auto px-6 pb-32">
         <div className="max-w-md mx-auto flex flex-col gap-3">
           {CV_PROJECTS.map((node, i) => (
             <motion.button
               key={node.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.07, duration: 0.4 }}
               onClick={() => handleQuestSelect(node.id)}
               className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                 isLightMode
                   ? 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-md'
                   : 'bg-slate-900/80 border-slate-700/60 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(13,148,136,0.15)]'
               }`}
             >
               {/* Number badge */}
               <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-lg ${
                 isLightMode
                   ? 'bg-orange-50 text-orange-600 border border-orange-200'
                   : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
               }`}>
                 {String(i + 1).padStart(2, '0')}
               </div>

               {/* Text */}
               <div className="flex-1 min-w-0">
                 <p className={`font-extrabold text-sm truncate ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>{node.title}</p>
                 <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 truncate ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>{node.category}</p>
               </div>

               {/* Arrow */}
               <svg className={`w-5 h-5 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
             </motion.button>
           ))}
         </div>
       </div>

       {/* ====== DESKTOP: Drag-to-Explore Map (≥768px) ====== */}
       <motion.div 
         ref={mapRef}
         drag
         dragConstraints={{ top: -300, left: -300, right: 300, bottom: 300 }}
         className="hidden md:flex absolute inset-0 cursor-grab active:cursor-grabbing items-center justify-center"
       >
          {/* Subtle Grid / Network Background */}
          <div className="absolute w-[2000px] h-[2000px] pointer-events-none opacity-40">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke={isLightMode ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)"} strokeWidth="1"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>

          {/* Nodes Container */}
          <div className="relative w-[1000px] h-[800px]">
             {/* Lines connecting nodes (SVG) */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d={`M ${CV_PROJECTS[0].x} ${CV_PROJECTS[0].y} L ${CV_PROJECTS[1].x} ${CV_PROJECTS[1].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
                <path d={`M ${CV_PROJECTS[0].x} ${CV_PROJECTS[0].y} L ${CV_PROJECTS[2].x} ${CV_PROJECTS[2].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
                <path d={`M ${CV_PROJECTS[2].x} ${CV_PROJECTS[2].y} L ${CV_PROJECTS[3].x} ${CV_PROJECTS[3].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
                <path d={`M ${CV_PROJECTS[3].x} ${CV_PROJECTS[3].y} L ${CV_PROJECTS[4].x} ${CV_PROJECTS[4].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
                <path d={`M ${CV_PROJECTS[4].x} ${CV_PROJECTS[4].y} L ${CV_PROJECTS[5].x} ${CV_PROJECTS[5].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
                <path d={`M ${CV_PROJECTS[5].x} ${CV_PROJECTS[5].y} L ${CV_PROJECTS[6].x} ${CV_PROJECTS[6].y}`} stroke={isLightMode ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="3" strokeDasharray="6,6" />
             </svg>

             {CV_PROJECTS.map((node, i) => (
               <motion.div
                 key={node.id}
                 className="absolute group z-10"
                 style={{ left: node.x, top: node.y }}
                 whileHover={{ scale: 1.05 }}
               >
                  <div 
                    onClick={() => handleQuestSelect(node.id)}
                    className={`w-24 h-24 -translate-x-1/2 -translate-y-1/2 premium-card flex flex-col items-center justify-center cursor-pointer border-2 group-hover:border-orange-400 group-hover:shadow-2xl transition-all ${isLightMode ? 'border-orange-200 bg-white' : 'border-orange-500/20 bg-slate-900/80'}`}
                    style={{ borderRadius: '50%' }}
                  >
                     <div className={`font-black text-3xl drop-shadow-sm transition-colors ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>
                        0{i + 1}
                     </div>
                  </div>
                  
                  <div className={`absolute top-14 left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none premium-card px-5 py-3 border-none shadow-xl ${isLightMode ? 'bg-white' : 'bg-slate-800'}`}>
                     <p className={`font-extrabold text-sm ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>{node.title}</p>
                     <p className={`font-bold tracking-widest mt-1 uppercase text-[10px] ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>{node.category}</p>
                  </div>
               </motion.div>
             ))}
          </div>
       </motion.div>

       {/* Drag Hint (desktop only) */}
       <AnimatePresence>
         {showDragHint && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             transition={{ duration: 0.5 }}
             className={`hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-30 items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border text-xs font-bold tracking-widest uppercase ${
               isLightMode
                 ? 'bg-white/80 border-slate-300 text-slate-500'
                 : 'bg-slate-900/80 border-slate-700 text-slate-400'
             }`}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
               <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
               <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
               <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
             </svg>
             Drag to explore
           </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
};
