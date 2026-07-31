import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { ProjectGraph } from './project-graph/ProjectGraph';

export const GameWorldMap: React.FC = () => {
  const t = useT();
  const { isLightMode, setGameState } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-10 overflow-hidden"
    >
       {/* ====== HEADER (Desktop & Mobile) ====== */}
       <div className="absolute top-[60px] md:top-24 left-0 w-full px-4 md:px-10 z-20 flex items-center justify-between pointer-events-none h-14 md:h-auto">
          {/* Back Button */}
          <div className="pointer-events-auto">
            <button 
              onClick={() => setGameState('SKILL_MATRIX')} 
              className={`flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-full border transition-all shadow-sm hover:shadow-md ${isLightMode ? 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white' : 'bg-slate-900/95 text-slate-100 border-slate-700 hover:bg-slate-800 backdrop-blur-md'}`}
            >
               <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
               </svg>
               <span className="hidden md:block ml-2 font-semibold text-sm">{t("map.backToProfile")}</span>
            </button>
          </div>

          {/* Titles */}
          <div className="pointer-events-none">
            <div className={`inline-flex flex-col items-end text-right md:px-6 md:py-3 md:rounded-2xl md:backdrop-blur-md md:transition-colors ${isLightMode ? 'md:bg-white/95 md:shadow-sm md:border md:border-slate-200' : 'md:bg-slate-900/95 md:shadow-lg md:border md:border-slate-700/50'}`}>
              <h2 className={`text-xl md:text-2xl font-extrabold tracking-tight leading-tight ${isLightMode ? 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] md:drop-shadow-none' : 'text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:drop-shadow-none'}`}>
                {t("map.projectJourney")}
              </h2>
              <span className={`block font-bold tracking-widest mt-0.5 uppercase text-[10px] md:text-[11px] ${isLightMode ? 'text-orange-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] md:drop-shadow-none' : 'text-orange-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:drop-shadow-none'}`}>
                {t("map.exploreCaseStudies")}
              </span>
            </div>
          </div>
       </div>

       {/* ====== SCORPIO GRAPH ====== */}
       <ProjectGraph />
    </motion.div>
  );
};
