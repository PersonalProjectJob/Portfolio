import React from 'react';
import { motion } from 'framer-motion';
import { CV_PROJECTS } from '../data/cvData';
import { useStore } from '../store/useStore';

export const GameQuestLog: React.FC = () => {
  const { isLightMode, selectedQuest, setGameState, handleQuestSelect } = useStore();
  const project = CV_PROJECTS.find(p => p.id === selectedQuest);

  if (!project) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center w-full max-w-4xl py-4 md:py-10 px-4"
    >
       {/* Dark overlay for focus */}
       <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm -z-10" onClick={() => setGameState('PROJECT_JOURNEY')} />

       <div className={`w-full p-6 md:p-12 relative transition-all duration-500 rounded-3xl border mb-32 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card bg-slate-900/95'}`}>
          
          {/* Header */}
          <div className={`flex justify-between items-start mb-10 border-b pb-8 relative z-10 ${isLightMode ? 'border-slate-200' : 'border-slate-700'}`}>
             <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border ${isLightMode ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-orange-950/50 text-orange-400 border-orange-500/20'}`}>{project.category}</span>
                   <span className={`uppercase font-bold text-[10px] tracking-widest ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Role: {project.role}</span>
                </div>
                <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-slate-100'} mb-4`}>{project.title}</h2>
                {selectedQuest && (
                   <button onClick={() => handleQuestSelect(selectedQuest)} className="mt-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(13,148,136,0.4)] flex items-center gap-2 transition-all hover:scale-105">
                     View Full Case Study
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                   </button>
                )}
             </div>
             <button onClick={() => setGameState('PROJECT_JOURNEY')} className={`transition-colors p-3 rounded-full border sticky top-0 ${isLightMode ? 'text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200' : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>

          {/* Body */}
          <div className={`space-y-10 relative z-10 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
             
             {/* Context */}
             <div>
                <h3 className={`text-xl mb-4 flex items-center gap-3 font-extrabold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isLightMode ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-orange-950/50 text-orange-400 border-orange-500/20'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                  Context & Challenge
                </h3>
                <p className="text-sm md:text-base leading-relaxed">{project.context}</p>
             </div>

             {/* Solution & Execution */}
             <div>
                <h3 className={`text-xl mb-4 flex items-center gap-3 font-extrabold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isLightMode ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-amber-950/50 text-amber-400 border-amber-500/20'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  Execution Strategy
                </h3>
                <ul className={`list-none space-y-4 pl-5 border-l-2 text-sm md:text-base ${isLightMode ? 'border-slate-200' : 'border-slate-700'}`}>
                   {project.solution.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                         <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" /> 
                         {item}
                      </li>
                   ))}
                </ul>
             </div>

             {/* Impact */}
             <div className={`p-6 md:p-8 rounded-3xl border transition-colors ${isLightMode ? 'bg-white/30 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_rgba(30,41,59,0.04)]' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <h3 className={`text-xl mb-6 flex items-center gap-3 font-extrabold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isLightMode ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-amber-950/50 text-amber-400 border-amber-500/20'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg></div>
                  Results & Impact
                </h3>
                 <div className="flex flex-wrap gap-4 md:gap-6">
                   {project.results.map((res, idx) => (
                      <div key={idx} className={`px-5 py-4 rounded-2xl border flex flex-col flex-1 min-w-[140px] md:min-w-[160px] transition-colors ${isLightMode ? 'bg-white/60 border-white shadow-sm' : 'bg-slate-900/60 border-slate-700 shadow-sm'}`}>
                         <span className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{res.label}</span>
                         <span className={`text-xl md:text-2xl font-black ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>{res.value}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
};
