import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '../i18n/useT';

// --- Icons ---
const MapPinIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const LayersIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ArrowRightIcon = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

const cryptomapDecisions = [
  {
    number: '01',
    label: 'Discover with intent',
    title: 'Spatial discovery without map overload',
    description: 'Clustering turns more than 200 locations into a readable starting point, while the WHERE / WHAT / COIN filters let users express intent before zooming into individual merchants.',
    image: '/images/case-study/cryptomap_global_dashboard.png',
    alt: 'CryptoMap360 world map with clustered merchant locations and intent filters',
    accent: 'text-amber-500',
    surface: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    number: '02',
    label: 'Build trust',
    title: 'Verified market data at decision time',
    description: 'Price movement, verified status and supported assets are surfaced with restrained color coding so people can evaluate a location or asset without leaving the core experience.',
    image: '/images/case-study/cryptomap_market_live.png',
    alt: 'Live CryptoMap360 market page with market cap, trending assets, top gainers and crypto price table',
    accent: 'text-cyan-500',
    surface: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    number: '03',
    label: 'Grow verified supply',
    title: 'A guided listing and approval workflow',
    description: 'The B2B listing process is broken into a clear wizard with inline validation. New projects appear in the ecosystem only after admin verification, protecting data quality as coverage grows.',
    image: '/images/case-study/cryptomap_wizard.png',
    alt: 'CryptoMap360 multi-step coin listing wizard',
    accent: 'text-violet-500',
    surface: 'bg-violet-500/10 border-violet-500/20',
  },
];

export const ProjectCryptomap: React.FC = () => {
  const { isLightMode, } = useStore();
  const t = useT();
  
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#050510]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-white/5 border-white/10 backdrop-blur-xl',
    accent: isLightMode ? 'text-orange-600' : 'text-orange-400',
    glow: isLightMode ? '' : 'shadow-glow-teal'
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  } as const;

  const [stats, setStats] = useState({ locations: 0, requests: 0, lcp: 0, inp: 0 });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ locations: 200, requests: 8680, lcp: 3.3, inp: 170 });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CaseStudyLayout>
      
      {/* Background Wrapper */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${isLightMode ? 'from-amber-50/40 via-slate-50 to-slate-100' : 'from-[#101827] via-[#050510] to-[#050510]'}`} />
        <div className="absolute -right-[12%] -top-[20%] h-[55vw] w-[55vw] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute -left-[15%] top-[35%] h-[45vw] w-[45vw] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>
        
      {/* --- 00. HERO --- */}
      <motion.section 
        initial="hidden" animate="visible" variants={fadeInUp}
        className="min-h-[70vh] flex flex-col justify-center items-center text-center pb-20 md:pb-32 relative z-10"
      >
        <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-2xl group mb-10">
            <img loading="lazy" decoding="async" src="/images/case-study/cryptomap_global_dashboard.png" alt="CryptoMap360 global merchant discovery map" className="aspect-[16/9] w-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 text-left sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <span className="inline-flex rounded-full border border-amber-400/30 bg-slate-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 backdrop-blur-md">{t('cryptomap.hero.tag')}</span>
                <p className="mt-3 max-w-lg text-sm font-medium text-slate-200 sm:text-base">{t('cryptomap.hero.desc')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['200+ locations', '8.68k requests', '2-week MVP'].map((proof) => (
                  <span key={proof} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md">{proof}</span>
                ))}
              </div>
            </div>
        </div>
        
        <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 ${theme.text}`}>
          {t('cryptomap.hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{t('cryptomap.hero.title2')}</span>{t('cryptomap.hero.title3')}
        </h1>
        <p className={`text-lg md:text-xl max-w-2xl ${theme.textMuted} leading-relaxed mx-auto px-4`}>
          {t('cryptomap.hero.subtitle')}
        </p>
      </motion.section>

      {/* --- 01. EXECUTIVE SUMMARY --- */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-16 md:py-24 relative z-10"
      >
        <div className={`max-w-6xl mx-auto rounded-3xl card-padding-lg border ${theme.card} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="mb-12 border-b border-orange-500/20 pb-4">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.accent}`}>{t('cryptomap.summary.tag')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <h5 className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>{t('cryptomap.summary.role.label')}</h5>
              <p className={`font-semibold ${theme.text}`}>{t('cryptomap.summary.role.value')}</p>
            </div>
            <div className="md:col-span-1">
              <h5 className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>{t('cryptomap.summary.timeline.label')}</h5>
              <p className={`font-semibold ${theme.text}`}>{t('cryptomap.summary.timeline.value')}</p>
              <p className={`mt-1 text-[10px] ${theme.textMuted}`}>{t('cryptomap.summary.timeline.note')}</p>
            </div>
            <div className="md:col-span-1">
              <h5 className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>{t('cryptomap.summary.platform.label')}</h5>
              <p className={`font-semibold ${theme.text}`}>{t('cryptomap.summary.platform.value')}</p>
            </div>
            <div className="md:col-span-1">
              <h5 className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>{t('cryptomap.summary.metric.label')}</h5>
              <p className={`font-bold ${theme.accent}`}>{t('cryptomap.summary.metric.value')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}><LayersIcon/> {t('cryptomap.summary.problem.title')}</h4>
              <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                {t('cryptomap.summary.problem.desc')}
              </p>
            </div>
            <div>
              <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}><MapPinIcon/> {t('cryptomap.summary.solution.title')}</h4>
              <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                {t('cryptomap.summary.solution.desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 02. DISCOVERY (The Why) --- */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-16 md:py-24 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.accent} mb-4 block`}>{t('cryptomap.discovery.tag')}</span>
            <h3 className={`text-3xl md:text-5xl font-black tracking-tight uppercase ${theme.text} mb-6 whitespace-pre-line`}>{t('cryptomap.discovery.title')}</h3>
            <p className={`text-lg ${theme.textMuted}`}>
              {t('cryptomap.discovery.desc')}
            </p>
          </div>

          <div className="space-y-16 md:space-y-32">
            {/* Research Page 1: Macro Context */}
            <div className={`rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl min-h-[400px] flex flex-col justify-center card-padding-lg bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F2937]`}>
              <div className="absolute top-8 right-8 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-sm">
                 <span className="text-sm font-bold text-white tracking-wide">{t('cryptomap.discovery.step1.tag')}</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 mt-12 items-start relative z-10">
                <div className="md:w-1/2 space-y-8">
                  <div>
                    <h4 className={`text-xl font-bold mb-4 text-white`}>{t('cryptomap.discovery.step1.insight')}</h4>
                    <ul className="list-disc pl-6 space-y-4 text-slate-300 font-medium text-lg">
                      <li>{t('cryptomap.discovery.step1.bullet1')}</li>
                      <li>
                        {t('cryptomap.discovery.step1.bullet2')}
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-base text-slate-400">
                          <li><strong className="text-orange-400">{t('cryptomap.discovery.step1.bullet2a')}</strong></li>
                          <li>{t('cryptomap.discovery.step1.bullet2b')}</li>
                        </ul>
                      </li>
                      <li>
                        {t('cryptomap.discovery.step1.bullet3')}
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-base text-slate-400">
                          <li>{t('cryptomap.discovery.step1.bullet3a')}</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border-t-2 border-dashed border-white/10 pt-8 w-full">
                    <h4 className={`text-xl font-bold mb-4 text-white`}>{t('cryptomap.discovery.step1.pain')}</h4>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300 font-medium text-lg">
                      <li>{t('cryptomap.discovery.step1.pain1')}
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-base text-slate-400">
                          <li>{t('cryptomap.discovery.step1.pain1a')}</li>
                          <li>{t('cryptomap.discovery.step1.pain1b')}</li>
                          <li>{t('cryptomap.discovery.step1.pain1c')}</li>
                          <li>{t('cryptomap.discovery.step1.pain1d')}</li>
                        </ul>
                      </li>
                    </ul>
                    <p className="mt-6 text-lg text-slate-300">{t('cryptomap.discovery.step1.mission1')}<strong className="font-bold text-white">{t('cryptomap.discovery.step1.mission2')}</strong>.</p>
                  </div>
                </div>
                
                <div className="md:w-1/2 w-full flex justify-center items-center">
                  <div className="w-full max-w-lg bg-white/5 p-4 rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
                    <img loading="lazy" decoding="async" src="/images/case-study/chart_1.webp" alt="Where Grassroots Crypto Adoption Is Highest" className="w-full h-auto rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Research Page 2: Competitive Audit */}
            <div className={`rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl min-h-[400px] flex flex-col card-padding-lg bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E1B4B]`}>
              <div className="absolute top-8 right-8 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-sm">
                 <span className="text-sm font-bold text-white tracking-wide">{t('cryptomap.discovery.step2.tag')}</span>
              </div>
              
              <div className="mt-16 w-full max-w-5xl mx-auto bg-[#0B0F19]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="p-6 md:p-8 hover:bg-white/5 transition-colors group">
                       <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircleIcon /></div>
                         CoinGecko
                       </h3>
                       <div className="mb-6">
                         <h4 className="text-sm font-bold uppercase text-green-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.pros')}</h4>
                         <ul className="space-y-2 text-slate-300 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.cg.pro1')}</li>
                           <li>{t('cryptomap.discovery.step2.cg.pro2')}</li>
                           <li>{t('cryptomap.discovery.step2.cg.pro3')}</li>
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-sm font-bold uppercase text-red-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.cons')}</h4>
                         <ul className="space-y-2 text-slate-400 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.cg.con1')}</li>
                           <li>{t('cryptomap.discovery.step2.cg.con2')}</li>
                           <li>{t('cryptomap.discovery.step2.cg.con3')}</li>
                         </ul>
                       </div>
                    </div>
                    
                    <div className="p-6 md:p-8 hover:bg-white/5 transition-colors group">
                       <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400"><CheckCircleIcon /></div>
                         CoinATMRadar
                       </h3>
                       <div className="mb-6">
                         <h4 className="text-sm font-bold uppercase text-green-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.pros')}</h4>
                         <ul className="space-y-2 text-slate-300 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.car.pro1')}</li>
                           <li>{t('cryptomap.discovery.step2.car.pro2')}</li>
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-sm font-bold uppercase text-red-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.cons')}</h4>
                         <ul className="space-y-2 text-slate-400 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.car.con1')}</li>
                           <li>{t('cryptomap.discovery.step2.car.con2')}</li>
                           <li>{t('cryptomap.discovery.step2.car.con3')}</li>
                           <li>{t('cryptomap.discovery.step2.car.con4')}</li>
                         </ul>
                       </div>
                    </div>
                    
                    <div className="p-6 md:p-8 hover:bg-white/5 transition-colors group">
                       <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-400"><CheckCircleIcon /></div>
                         Coinmap
                       </h3>
                       <div className="mb-6">
                         <h4 className="text-sm font-bold uppercase text-green-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.pros')}</h4>
                         <ul className="space-y-2 text-slate-300 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.cm.pro1')}</li>
                           <li>{t('cryptomap.discovery.step2.cm.pro2')}</li>
                         </ul>
                       </div>
                       <div>
                         <h4 className="text-sm font-bold uppercase text-red-400 mb-3 tracking-wider">{t('cryptomap.discovery.step2.cons')}</h4>
                         <ul className="space-y-2 text-slate-400 font-medium text-sm">
                           <li>{t('cryptomap.discovery.step2.cm.con1')}</li>
                           <li>{t('cryptomap.discovery.step2.cm.con2')}</li>
                           <li>{t('cryptomap.discovery.step2.cm.con3')}</li>
                           <li>{t('cryptomap.discovery.step2.cm.con4')}</li>
                         </ul>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Research Page 3: User Persona */}
            <div className={`rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl min-h-[400px] flex flex-col justify-center card-padding-lg bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F2937]`}>
              <div className="absolute top-8 right-8 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-sm">
                 <span className="text-sm font-bold text-white tracking-wide">{t('cryptomap.discovery.step3.tag')}</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 mt-12 items-center relative z-10">
                <div className="md:w-1/3">
                   <h3 className="text-4xl font-black text-white mb-4">{t('cryptomap.discovery.step3.pain')}</h3>
                   <div className="w-16 h-1 bg-red-500 rounded-full mb-6"></div>
                   <p className="text-xl text-slate-300 font-medium leading-relaxed">
                     {t('cryptomap.discovery.step3.desc')}
                   </p>
                </div>
                
                <div className="md:w-2/3 w-full flex justify-center">
                  <div className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                    <img loading="lazy" decoding="async" src="/images/case-study/chart_3.png" alt="User Personas" className="w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Research Page 4: Pain Points & Mission */}
            <div className={`rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl min-h-[400px] flex flex-col justify-center card-padding-lg bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E1B4B]`}>
              <div className="absolute top-8 right-8 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-sm">
                 <span className="text-sm font-bold text-white tracking-wide">{t('cryptomap.discovery.step4.tag')}</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 mt-12 items-center relative z-10">
                <div className="md:w-1/3">
                   <h3 className="text-3xl font-black text-white mb-4">{t('cryptomap.discovery.step4.title')}</h3>
                   <div className="w-16 h-1 bg-purple-500 rounded-full mb-6"></div>
                   <p className="text-lg text-slate-300 font-medium leading-relaxed">
                     {t('cryptomap.discovery.step4.desc')}
                   </p>
                </div>
                
                <div className="md:w-2/3 w-full flex justify-center">
                  <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                    <img loading="lazy" decoding="async" src="/images/case-study/chart_4.webp" alt="Custom Journey Map" className="w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* --- 03. STRATEGY & ARCHITECTURE (The How) --- */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-16 md:py-24 relative z-10 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.accent} mb-4 block`}>{t('cryptomap.strategy.tag')}</span>
            <h3 className={`text-3xl md:text-5xl font-black tracking-tight uppercase ${theme.text} mb-6 whitespace-pre-line`}>{t('cryptomap.strategy.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Journey Map */}
            <div>
              <h4 className={`text-xl font-bold mb-8 flex items-center gap-2 ${theme.text}`}><ArrowRightIcon/> {t('cryptomap.strategy.journey.title')}</h4>
              <div className="relative pl-6 border-l-2 border-orange-500/30 space-y-8">
                
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-orange-500"></div>
                  <h5 className={`text-md font-bold mb-1 ${theme.text}`}>{t('cryptomap.strategy.journey.step1.title')}</h5>
                  <p className={`text-sm ${theme.textMuted}`}>{t('cryptomap.strategy.journey.step1.desc')}</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500"></div>
                  <h5 className={`text-md font-bold mb-1 ${theme.text}`}>{t('cryptomap.strategy.journey.step2.title')}</h5>
                  <p className={`text-sm ${theme.textMuted}`}>{t('cryptomap.strategy.journey.step2.desc')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-orange-500"></div>
                  <h5 className={`text-md font-bold mb-1 ${theme.text}`}>{t('cryptomap.strategy.journey.step3.title')}</h5>
                  <p className={`text-sm ${theme.textMuted}`}>{t('cryptomap.strategy.journey.step3.desc')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-green-500"></div>
                  <h5 className={`text-md font-bold mb-1 ${theme.text}`}>{t('cryptomap.strategy.journey.step4.title')}</h5>
                  <p className={`text-sm ${theme.textMuted}`}>{t('cryptomap.strategy.journey.step4.desc')}</p>
                </div>

              </div>
            </div>

            {/* Information Architecture Snippet */}
            <div className={`card-padding rounded-3xl ${theme.card} border-dashed border-2 flex flex-col justify-center`}>
              <h4 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.text}`}><LayersIcon/> {t('cryptomap.strategy.ia.title')}</h4>
              <div className="space-y-4 font-mono text-xs md:text-sm">
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-500 font-bold">1.0 Global Map (Home)</div>
                <div className="pl-6 space-y-2">
                  <div className={`p-2 rounded border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>1.1 Bottom Sheet: Merchant Details</div>
                  <div className={`p-2 rounded border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>1.2 Modal: Advanced Filters (What/Where/Coin)</div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-500 font-bold mt-4">2.0 Market Watch (Data)</div>
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-500 font-bold mt-2">3.0 B2B Portal</div>
                <div className="pl-6 space-y-2">
                  <div className={`p-2 rounded border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>3.1 Merchant Onboarding Wizard (Multi-step)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 04. DESIGN & EXECUTION (The What) --- */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-16 md:py-24 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.accent} mb-4 block`}>{t('cryptomap.design.tag')}</span>
            <h3 className={`text-3xl md:text-5xl font-black tracking-tight uppercase ${theme.text}`}>{t('cryptomap.design.title')}</h3>
          </div>

          <div className="flex flex-col gap-28">
            {cryptomapDecisions.map((decision, index) => (
              <article key={decision.number} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`relative lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`absolute -inset-5 rounded-[2rem] blur-3xl opacity-40 ${decision.surface}`} />
                  <div className={`relative overflow-hidden rounded-[2rem] border shadow-2xl ${isLightMode ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950'}`}>
                    <img loading="lazy" decoding="async" src={decision.image} alt={decision.alt} className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 hover:scale-[1.02]" />
                    <div className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-md ${decision.surface} ${decision.accent}`}>
                      {t('cryptomap.design.decision')} {decision.number}
                    </div>
                  </div>
                </div>
                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${decision.accent}`}>{decision.label}</p>
                  <h4 className={`mt-3 text-2xl font-black tracking-tight md:text-3xl ${theme.text}`}>{decision.title}</h4>
                  <p className={`mt-5 text-base leading-relaxed ${theme.textMuted}`}>{decision.description}</p>
                  <div className={`mt-7 rounded-2xl border p-4 ${decision.surface}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.14em] ${decision.accent}`}>{t('cryptomap.design.principle')}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>
                      {index === 0 && 'Reduce visual load first, then reveal detail as user intent becomes more specific.'}
                      {index === 1 && 'Use color to communicate change and verification—not to decorate dense data.'}
                      {index === 2 && 'Make data quality part of the user flow, rather than a hidden back-office task.'}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            <div className={`relative overflow-hidden rounded-[2rem] border card-padding ${isLightMode ? 'border-slate-200 bg-slate-950 text-white shadow-2xl' : 'border-white/10 bg-gradient-to-br from-[#111827] to-[#080b12] shadow-2xl'}`}>
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px]" />
              <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-5">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">{t('cryptomap.design.perf.tag')}</span>
                  <h4 className="mt-3 text-3xl font-black tracking-tight text-white">{t('cryptomap.design.perf.title')}</h4>
                  <p className="mt-5 text-sm leading-relaxed text-slate-300">{t('cryptomap.design.perf.desc')}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Clarity diagnosis', 'Marker clustering', 'Virtualized lists', 'API sequencing'].map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-7">
                  {[
                    { value: '80/100', label: 'Performance score', note: 'Measured after optimization', color: 'text-amber-300' },
                    { value: '3.3s', label: 'Largest Contentful Paint', note: 'With map-heavy data', color: 'text-cyan-300' },
                    { value: '170ms', label: 'Interaction to Next Paint', note: 'Rated Good', color: 'text-emerald-300' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                      <p className={`text-3xl font-black tracking-tight ${metric.color}`}>{metric.value}</p>
                      <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-white">{metric.label}</p>
                      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{metric.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 05. OUTCOMES & RETROSPECTIVE (The So What) --- */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className="py-16 md:py-24 relative z-10 border-t border-white/10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.accent} mb-4 block`}>{t('cryptomap.outcomes.tag')}</span>
            <h3 className={`text-3xl md:text-5xl font-black tracking-tight uppercase ${theme.text}`}>{t('cryptomap.outcomes.title')}</h3>
          </div>

          <div className={`relative rounded-3xl overflow-hidden shadow-2xl border ${theme.card} card-padding-lg mb-16`}>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Stat 1 */}
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">
                    {stats.locations > 0 ? '200+' : '0'}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>{t('cryptomap.outcomes.stat1.label')}</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>{t('cryptomap.outcomes.stat1.desc')}</div>
                </div>
                {/* Stat 2 */}
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">
                    {stats.requests > 0 ? '8.68k' : '0'}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>{t('cryptomap.outcomes.stat2.label')}</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>{t('cryptomap.outcomes.stat2.desc')}</div>
                </div>
                {/* Stat 3 */}
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-500">
                    {stats.lcp > 0 ? '3.3s' : '0'}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>{t('cryptomap.outcomes.stat3.label')}</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>{t('cryptomap.outcomes.stat3.desc')}</div>
                </div>
                {/* Stat 4 */}
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {stats.inp > 0 ? '170ms' : '0'}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>{t('cryptomap.outcomes.stat4.label')}</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>{t('cryptomap.outcomes.stat4.desc')}</div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className={`card-padding rounded-3xl ${theme.card}`}>
              <h4 className={`text-xl font-bold mb-6 text-orange-500`}>{t('cryptomap.outcomes.learnings.title')}</h4>
              <ul className={`space-y-4 text-sm ${theme.textMuted}`}>
                <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 text-orange-400"/> <span dangerouslySetInnerHTML={{ __html: t('cryptomap.outcomes.learnings.1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></li>
                <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 text-orange-400"/> <span dangerouslySetInnerHTML={{ __html: t('cryptomap.outcomes.learnings.2').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></li>
              </ul>
            </div>
            
            <div className={`card-padding rounded-3xl ${theme.card}`}>
              <h4 className={`text-xl font-bold mb-6 text-blue-500`}>{t('cryptomap.outcomes.next.title')}</h4>
              <ul className={`space-y-4 text-sm ${theme.textMuted}`}>
                <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 text-blue-400"/> <span dangerouslySetInnerHTML={{ __html: t('cryptomap.outcomes.next.1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></li>
                <li className="flex items-start gap-3"><CheckCircleIcon className="w-5 h-5 shrink-0 text-blue-400"/> <span dangerouslySetInnerHTML={{ __html: t('cryptomap.outcomes.next.2').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

    </CaseStudyLayout>
  );
};
