import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const experiences = [
  {
    period: "Aug 2025 - May 2026",
    role: "UX Designer - MVP AI Builder",
    company: "StartechAI",
    details: [
      "Projects: Cryptomap360, Bitcoin Nail Bar, Pateso da cóc Cô Tươi",
      "Specialized in building and designing MVPs using AI (Figma Make, Supabase, Cursor, Deepseek).",
      "Conducted user research, designed search flows and scalable UI systems.",
      "Coordinated with PM and Backend Devs to define logic and feasibility.",
    ]
  },
  {
    period: "Nov 2023 - Jun 2025",
    role: "UX/UI Designer",
    company: "StartechAI",
    details: [
      "Key Projects: VLINKPAY (US Market), Crypto flow UX, Spin Game.",
      "Analyzed requirements, brainstormed solutions, and designed wireframes.",
      "Collaborated with BA & Devs during grooming and implementation.",
      "Monitored product post-production and handled user feedback."
    ]
  },
  {
    period: "Mar 2023 - Mar 2024",
    role: "Freelance Designer",
    company: "Talucan (E-commerce)",
    details: [
      "POD product design.",
      "Edited and optimized WordPress websites."
    ]
  },
  {
    period: "Jan 2020 - Mar 2023",
    role: "Jr. Graphic/UX-UI Designer",
    company: "5S Group",
    details: [
      "Supported analysis and UX/UI design for WMS (Warehouse) and TMS (Transportation).",
      "Designed the outsourced product 'Quick Order' for Colgate internal use.",
      "Designed banners and marketing materials."
    ]
  }
];

export const GameExperienceTimeline: React.FC = () => {
  const { isLightMode, setGameState } = useStore();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`w-full max-w-4xl mx-auto rounded-2xl shadow-xl border backdrop-blur-md flex flex-col ${
        isLightMode 
          ? 'bg-white/95 border-slate-200' 
          : 'bg-[#0f172a]/95 border-slate-700'
      }`}
    >
      {/* Header */}
      <div className={`p-4 md:p-6 border-b flex justify-between items-center ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0b101e]'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border ${isLightMode ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-600'}`}>
            XP
          </div>
          <div>
            <h2 className={`font-black text-xl md:text-2xl uppercase tracking-wider ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>Experience Tree</h2>
            <p className={`text-xs md:text-sm font-medium ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>Leveling up through the years</p>
          </div>
        </div>
        <button 
          onClick={() => setGameState('SELECT_PROFILE')}
          className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
            isLightMode 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Close
        </button>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 p-6 md:p-10 pb-24 md:pb-40">
        <div className="relative flex flex-col gap-12 md:gap-16">
          {/* Central solid line */}
          <div className={`absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 rounded-full ${isLightMode ? 'bg-slate-200' : 'bg-slate-700'}`}></div>

          {experiences.map((exp, index) => {
            const isEven = index % 2 === 0;
            const cardContent = (
              <div className={`p-5 rounded-xl border transition-all text-left w-full ${
                isLightMode 
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50' 
                  : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
              }`}>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mb-3 ${isLightMode ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                  {exp.period}
                </div>
                <h3 className={`text-lg font-black mt-1 ${isLightMode ? 'text-slate-800' : 'text-slate-100'}`}>{exp.role}</h3>
                <h4 className={`text-sm font-bold mb-4 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>@ {exp.company}</h4>
                
                <ul className={`text-sm space-y-2 mt-4 text-left ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {exp.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`mt-1 text-xs ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>•</span>
                      <span className="flex-1 leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="w-full relative"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex w-full items-center relative">
                  {/* Center Dot */}
                  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 ${isLightMode ? 'bg-white border-slate-400' : 'bg-[#0f172a] border-slate-500'}`}></div>

                  {/* Connector Line (Left or Right) */}
                  <div className={`absolute top-1/2 -translate-y-1/2 h-[2px] w-10 ${isLightMode ? 'bg-slate-200' : 'bg-slate-700'} ${
                    isEven 
                      ? 'right-1/2 mr-[8px]' 
                      : 'left-1/2 ml-[8px]'
                  }`}></div>

                  {/* Left Half (isEven) */}
                  <div className={`w-1/2 flex justify-end pr-12 relative ${isEven ? '' : 'invisible'}`}>
                    <div className="w-full max-w-[450px]">
                      {cardContent}
                    </div>
                  </div>

                  {/* Right Half (!isEven) */}
                  <div className={`w-1/2 flex justify-start pl-12 relative ${!isEven ? '' : 'invisible'}`}>
                    <div className="w-full max-w-[450px]">
                      {cardContent}
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden w-full pl-16 relative">
                  <div className={`absolute left-8 top-6 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 ${isLightMode ? 'bg-white border-slate-400' : 'bg-[#0f172a] border-slate-500'}`}></div>
                  {cardContent}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
