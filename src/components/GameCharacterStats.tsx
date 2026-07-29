import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';

export const GameCharacterStats: React.FC = () => {
  const t = useT();
  const { isLightMode, setGameState } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-start w-full max-w-6xl container-padding shrink-0 pt-6 md:pt-10"
    >
       <div className="w-full flex flex-col gap-6 md:gap-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
             {/* LEFT COLUMN */}
             <div className="flex flex-col gap-6 md:gap-8">
                {/* {t("skills.coreCompetencies")} (Radar Chart) */}
                <div className={`card-padding rounded-3xl border transition-all duration-500 flex flex-col items-center h-fit lg:min-h-[480px] ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                   <h3 className={`text-lg font-extrabold mb-4 flex items-center gap-3 w-full transition-colors ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_10px_rgba(13,148,136,0.2)] transition-colors ${isLightMode ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-orange-950/50 text-orange-400 border-orange-500/20'}`}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
                      </div>
                      Core Competencies
                   </h3>
                   
                   <div className="w-full max-w-[350px] aspect-square relative flex items-center justify-center">
                       <RadarChart isLightMode={isLightMode} />
                   </div>
                </div>

                {/* {t("skills.education")} */}
                <div className={`p-5 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col h-fit ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                   <div className="flex justify-between items-center mb-6 md:mb-8">
                      <h3 className={`text-lg font-extrabold flex items-center gap-3 transition-colors ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-colors ${isLightMode ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-950/50 text-blue-400 border-blue-500/20'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                         </div>
                         Education & Awards
                      </h3>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                      <AwardBadge 
                         title={t("skills.award.title")} 
                         subtitle={t("skills.award.subtitle")} 
                         isLightMode={isLightMode} 
                      />
                      <EduItem title={t("skills.edu.1.title")} school="Uxfoundation.vn" date="JUN 2025" isLightMode={isLightMode} />
                      <EduItem title={t("skills.edu.2.title")} school="Uxfoundation.vn" date="OCT 2024" isLightMode={isLightMode} />
                      <EduItem title={t("skills.edu.3.title")} school="cusc.ctu.edu.vn" date="2019 - 2020" isLightMode={isLightMode} />
                   </div>
                </div>
             </div>

             {/* RIGHT COLUMN */}
             <div className="flex flex-col gap-6 md:gap-8">
                {/* Mindset / Passive Skills */}
                <div className={`p-5 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col h-fit lg:min-h-[480px] ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                   <h3 className={`text-lg font-extrabold mb-6 flex items-center gap-3 w-full transition-colors ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-colors ${isLightMode ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-950/50 text-amber-400 border-amber-500/20'}`}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      </div>
                      {t("skills.passiveSkills")}
                   </h3>
                   
                   <div className="flex flex-col gap-4 mt-2 justify-center flex-grow">
                      <HexagonNode 
                         title={t("skills.passive.1.title")} 
                         desc={t("skills.passive.1.desc")}
                         isLightMode={isLightMode}
                      />
                      <HexagonNode 
                         title={t("skills.passive.2.title")} 
                         desc={t("skills.passive.2.desc")}
                         isLightMode={isLightMode}
                      />
                      <HexagonNode 
                         title={t("skills.passive.3.title")} 
                         desc={t("skills.passive.3.desc")}
                         isLightMode={isLightMode}
                      />
                   </div>
                </div>

                {/* Toolkit (Gear) */}
                <div className={`p-5 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col h-fit ${isLightMode ? 'bg-white/90 backdrop-blur-3xl border-white/80 shadow-[0_8px_32px_rgba(30,41,59,0.12)]' : 'premium-card'}`}>
                   <div className="flex justify-between items-center mb-6 md:mb-8">
                      <h3 className={`text-lg font-extrabold flex items-center gap-3 transition-colors ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-colors ${isLightMode ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-950/50 text-amber-400 border-amber-500/20'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                         </div>
                         {t("skills.toolkit")}
                      </h3>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      <ToolCard 
                         name="Figma" 
                         category={t("skills.tool.primaryDesign")} 
                         isLightMode={isLightMode}
                         icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 38 57"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 47.5a9.5 9.5 0 0 1 9.5-9.5H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/></svg>} 
                      />
                      <ToolCard 
                         name="AI Tools" 
                         category={t("skills.tool.vibeCoding")} 
                         isLightMode={isLightMode}
                         icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#10A37F"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.596 8.3829 14.6163 7.214a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>} 
                      />
                      <ToolCard 
                         name="VS Code" 
                         category={t("skills.tool.development")} 
                         isLightMode={isLightMode}
                         icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="#0065A9" d="M22.61,3.48,5.43,16l-5-4.22L0,12.35v7.19l.39.49,5-4L22.61,28.52l9.39-3.79v-17.5Z" /><path fill="#007ACC" d="M22.61,3.48,5.43,16,22.61,28.52Z" /><path fill="#1F9CF0" d="M22.61,16l9.39-7.22V3.48l-9.39-3Z" /><path fill="#0065A9" d="M22.61,16V28.52l9.39-3.79V19.45Z" /></svg>} 
                      />
                      <ToolCard 
                         name="React JS" 
                         category={t("skills.tool.frontendUi")} 
                         isLightMode={isLightMode}
                         icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#61DAFB"><circle cx="12" cy="12" r="2.5" /><ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="#61DAFB" strokeWidth="1.5" /><ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)" /></svg>} 
                      />
                    </div>
                 </div>

                 {/* Action Bar */}
                 <div className="flex flex-col-reverse xl:flex-row justify-end items-center gap-4 w-full">
                    <button onClick={() => setGameState('SELECT_PROFILE')} className={`whitespace-nowrap w-full md:w-auto px-8 py-4 rounded-xl text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-4 border shrink-0 ${isLightMode ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 shadow-[0_5px_15px_rgba(0,0,0,0.05)]' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-orange-500/50 shadow-[0_5px_15px_rgba(0,0,0,0.2)]'}`}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                       {t("skills.backToProfile")}
                    </button>
                    <button onClick={() => setGameState('PROJECT_JOURNEY')} className="whitespace-nowrap w-full md:w-auto px-8 py-4 rounded-xl text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-4 shrink-0 shadow-[0_0_20px_rgba(13,148,136,0.3)] bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]">
                       {t("skills.viewProject")}
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
    </motion.div>
  );
};

/* --- NEW COMPONENTS --- */

const RadarChart = ({ isLightMode }: { isLightMode?: boolean }) => {
   const t = useT();
   const data = [
     { label: t('skills.radar.userResearch'), value: 0.8 },
     { label: t('skills.radar.uiSystemDesign'), value: 0.7 },
     { label: t('skills.radar.productStrategy'), value: 0.7 },
     { label: t('skills.radar.rapidPrototyping'), value: 0.9 },
     { label: t('skills.radar.usabilityTesting'), value: 0.7 },
     { label: t('skills.radar.aiIntegration'), value: 0.9 },
   ];
 
   const cx = 200;
   const cy = 200;
   const r = 110;
 
   const getPoint = (angleIndex: number, length: number) => {
     const angle = (angleIndex * 60 - 90) * (Math.PI / 180);
     return {
       x: cx + length * Math.cos(angle),
       y: cy + length * Math.sin(angle)
     };
   };
 
   // Generate polygon points
   const innerGrid = data.map((_, i) => getPoint(i, r * 0.33)).map(p => `${p.x},${p.y}`).join(' ');
   const middleGrid = data.map((_, i) => getPoint(i, r * 0.66)).map(p => `${p.x},${p.y}`).join(' ');
   const outerGrid = data.map((_, i) => getPoint(i, r)).map(p => `${p.x},${p.y}`).join(' ');
   
   const valuePoints = data.map((d, i) => getPoint(i, r * d.value)).map(p => `${p.x},${p.y}`).join(' ');
 
   const gridColor = isLightMode ? '#cbd5e1' : '#334155';
   const labelColor = isLightMode ? '#475569' : '#94a3b8';
 
   return (
     <svg width="100%" height="100%" viewBox="0 0 400 400" className="drop-shadow-xl overflow-visible">
       <defs>
         <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
           <stop offset="0%" stopColor="#818cf8" stopOpacity={isLightMode ? "0.6" : "0.4"} />
           <stop offset="100%" stopColor="#c084fc" stopOpacity={isLightMode ? "0.2" : "0.1"} />
         </radialGradient>
         <filter id="glow">
           <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
           <feMerge>
             <feMergeNode in="coloredBlur"/>
             <feMergeNode in="SourceGraphic"/>
           </feMerge>
         </filter>
       </defs>
       
       {/* Background Grids */}
       <polygon points={outerGrid} fill="none" stroke={gridColor} strokeWidth="1" />
       <polygon points={middleGrid} fill="none" stroke={gridColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
       <polygon points={innerGrid} fill="none" stroke={gridColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
 
       {/* Spoke Lines */}
       {data.map((_, i) => {
         const p = getPoint(i, r);
         return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={gridColor} strokeWidth="1" />;
       })}
 
       {/* Data Polygon */}
       <motion.polygon 
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1, delay: 0.2, type: "spring" }}
         style={{ transformOrigin: 'center' }}
         points={valuePoints} 
         fill="url(#radarFill)" 
         stroke="#818cf8" 
         strokeWidth="2" 
         filter="url(#glow)"
       />
 
       {/* Data Nodes */}
       {data.map((d, i) => {
         const p = getPoint(i, r * d.value);
         return (
           <motion.circle 
             key={`node-${i}`}
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
             cx={p.x} 
             cy={p.y} 
             r="4" 
             fill="#c084fc" 
             stroke="#fff" 
             strokeWidth="1.5"
             filter="url(#glow)"
           />
         );
       })}
 
       {/* Labels */}
       {data.map((d, i) => {
         const p = getPoint(i, r + 25);
         let textAnchor: "start" | "middle" | "end" = "middle";
         if (p.x < cx - 10) textAnchor = "end";
         if (p.x > cx + 10) textAnchor = "start";
         
         return (
           <text 
             key={`label-${i}`} 
             x={p.x} 
             y={p.y + 4} 
             textAnchor={textAnchor}
             fontSize="10"
             fontWeight="700"
             fill={labelColor}
             className="uppercase tracking-widest font-mono"
           >
             {d.label}
           </text>
         );
       })}
     </svg>
   );
};

const HexagonNode = ({ title, desc, isLightMode = false }: { title: string; desc: string; isLightMode?: boolean }) => {
   return (
      <div className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${isLightMode ? 'bg-white/50 border-slate-200 hover:bg-white hover:border-amber-300 hover:shadow-xl' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}>
         {/* Hexagon Icon */}
         <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
            <div className={`absolute inset-0 w-full h-full transition-colors duration-300 ${isLightMode ? 'bg-amber-100 group-hover:bg-amber-200' : 'bg-slate-800 group-hover:bg-amber-950'}`} style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`relative z-10 transition-colors duration-300 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
         </div>
         <div>
            <h4 className={`font-bold text-sm mb-1 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>{title}</h4>
            <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{desc}</p>
         </div>
      </div>
   );
};

const AwardBadge = ({ title, subtitle, isLightMode = false }: { title: string; subtitle: string; isLightMode?: boolean }) => (
   <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${isLightMode ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200 hover:shadow-lg' : 'bg-gradient-to-r from-amber-950/40 to-slate-900/40 border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'}`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/20 blur-2xl rounded-full group-hover:bg-amber-400/40 transition-all duration-500"></div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner z-10 ${isLightMode ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/50 text-amber-400'}`}>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
      </div>
      <div className="z-10">
         <h4 className={`font-black text-sm uppercase tracking-wide ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>{title}</h4>
         <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLightMode ? 'text-amber-600/80' : 'text-amber-400/70'}`}>{subtitle}</p>
      </div>
   </div>
);

const ToolCard = ({ name, category, icon, isLightMode = false }: { name: string; category: string; icon: React.ReactNode; isLightMode?: boolean }) => {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer ${isLightMode ? 'bg-white/60 border-white/60 hover:bg-white hover:border-orange-300 hover:shadow-[0_0_15px_rgba(13,148,136,0.15)]' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(13,148,136,0.3)]'} hover:-translate-y-1`}>
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] border transition-colors ${isLightMode ? 'bg-white border-slate-100' : 'bg-slate-800/80 border-slate-600/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]'}`}>
          {icon}
       </div>
       <div>
          <h4 className={`font-bold text-sm transition-colors ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>{name}</h4>
          <p className={`text-[9px] uppercase tracking-widest font-bold mt-1 transition-colors ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{category}</p>
       </div>
    </div>
  );
};

const EduItem = ({ title, school, date, isLightMode = false }: { title: string; school: string; date: string; isLightMode?: boolean }) => (
  <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-1 ${isLightMode ? 'bg-white/60 border-slate-200 hover:shadow-lg hover:border-orange-200' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-orange-500/50 hover:shadow-[0_5px_15px_rgba(13,148,136,0.2)]'}`}>
    <div>
      <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>{title}</h4>
      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>@ {school}</p>
    </div>
    <div className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border w-fit shrink-0 ${isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}>
      {date}
    </div>
  </div>
);
