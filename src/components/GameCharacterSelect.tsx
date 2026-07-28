import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export const GameCharacterSelect: React.FC = () => {
  const { isLightMode, setGameState } = useStore();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-start w-full max-w-6xl container-padding shrink-0 pt-6 md:pt-10"
    >
       <div className="w-full flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Left Column: Hero & Contact */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 md:gap-8">
             <div id="portfolio-contact" tabIndex={-1} className={`scroll-mt-28 card-padding flex flex-col items-center text-center rounded-3xl border outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-orange-400 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 mb-6 shadow-2xl bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-400 relative group overflow-hidden">
                   <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      <img src="/avatar.jpg" alt="Truong Nguyen Son Thao" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   </div>
                   <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                </div>
                
                <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Truong Nguyen Son Thao</h1>
                <h2 className={`text-sm md:text-base font-bold tracking-widest uppercase mb-6 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>Product Designer / UX-UI</h2>
                
                {/* Contact Links */}
                <div className="flex flex-wrap justify-center gap-3 w-full">
                   <a href="mailto:tnsthao94@gmail.com" className={`flex-1 min-w-[120px] py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 ${isLightMode ? 'bg-white/80 border-slate-300 text-slate-700 hover:shadow-lg hover:border-orange-300 hover:text-orange-600' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:border-orange-500/50 hover:text-orange-400'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Email Me</span>
                   </a>
                   <a href="https://www.linkedin.com/in/thaotns" target="_blank" rel="noreferrer" className={`flex-1 min-w-[120px] py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:-translate-y-1 ${isLightMode ? 'bg-white/80 border-slate-300 text-slate-700 hover:shadow-lg hover:border-orange-300 hover:text-orange-600' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:border-orange-500/50 hover:text-orange-400'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">LinkedIn</span>
                   </a>
                </div>
             </div>
             
             {/* Quick Stats Card */}
             <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-500 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                       <span className={`text-4xl font-black ${isLightMode ? 'text-orange-600' : 'text-orange-400 drop-shadow-[0_0_10px_rgba(13,148,136,0.5)]'}`}>3+</span>
                       <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Years Exp.</span>
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-4xl font-black ${isLightMode ? 'text-amber-600' : 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}>8</span>
                       <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Key Sectors</span>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-500/20">
                    <span className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Domain Expertise</span>
                    <div className="flex flex-wrap gap-2">
                       {['AI', 'Fintech', 'Digital Platforms'].map(tag => (
                          <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLightMode ? 'bg-orange-100 text-orange-700' : 'bg-orange-900/40 text-orange-300 border border-orange-500/30'}`}>{tag}</span>
                       ))}
                    </div>
                 </div>
             </div>
          </div>

          {/* Right Column: About & Core Competencies */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6 md:gap-8">
             {/* About Me Card */}
             <div id="portfolio-about" tabIndex={-1} className={`scroll-mt-28 p-6 md:p-10 rounded-3xl border outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-orange-400 relative overflow-hidden ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <h3 className={`text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                   <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </span>
                   Overview
                </h3>
                
                <div className={`prose prose-sm md:prose-base max-w-none text-left ${isLightMode ? 'text-slate-700 prose-strong:text-slate-900' : 'text-slate-300 prose-strong:text-white'}`}>
                   <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
                      I am a <strong>Product-oriented UX/UI Designer</strong> with over 2 years of experience building and launching Minimum Viable Products (MVPs) from research to release.
                   </p>
                   <p className="leading-relaxed mb-6">
                      Experienced in cross-department collaboration (PM, Dev, Sales), my goal is to translate complex business requirements into feasible product solutions. I focus heavily on optimizing the user experience while strictly ensuring technical viability.
                   </p>
                   <p className="leading-relaxed border-l-2 border-orange-500 pl-4 py-1 italic opacity-80">
                      "Design is not just what it looks like and feels like. Design is how it works."
                   </p>
                </div>
             </div>

             {/* Core Competencies */}
             <div className={`card-padding rounded-3xl border transition-all duration-500 ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                <h3 className={`text-sm font-black tracking-widest uppercase mb-8 flex items-center gap-3 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                   <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   </span>
                   Core Competencies
                </h3>
                
                <div className="flex flex-wrap gap-3">
                   {['Product Thinking', 'User Research', 'Collaboration', 'MVP Strategy', 'Problem Solving'].map(skill => (
                      <div key={skill} className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl flex items-center transition-all hover:scale-105 cursor-default border ${isLightMode ? 'bg-white shadow-sm border-slate-200 text-slate-800' : 'bg-slate-800/50 border-slate-700 text-slate-200 hover:border-orange-500/50 hover:bg-slate-800'}`}>
                         <span className="font-bold text-sm md:text-base">{skill}</span>
                      </div>
                   ))}
                </div>

                {/* Call to Action -> View Skills */}
                <div className="mt-10 pt-8 border-t border-slate-500/20 flex justify-end">
                   <button onClick={() => setGameState('SKILL_MATRIX')} className={`w-full md:w-auto px-8 py-4 rounded-xl text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(13,148,136,0.3)] ${isLightMode ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]'}`}>
                      Explore Skill Matrix
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                   </button>
                </div>

                {/* Mobile & Small Desktop: Experience & Playbook shortcuts */}
                <div className="2xl:hidden flex gap-3 mt-6 pt-6 border-t border-slate-500/20">
                   <button onClick={() => setGameState('EXPERIENCE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase border transition-all ${isLightMode ? 'bg-white border-slate-200 text-slate-700 active:bg-orange-50' : 'bg-slate-800/50 border-slate-600 text-slate-300 active:bg-slate-700'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                      Experience
                   </button>
                   <button onClick={() => setGameState('PROCESS')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase border transition-all ${isLightMode ? 'bg-white border-slate-200 text-slate-700 active:bg-orange-50' : 'bg-slate-800/50 border-slate-600 text-slate-300 active:bg-slate-700'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      Playbook
                   </button>
                </div>
             </div>
          </div>

       </div>
    </motion.div>
  );
};
