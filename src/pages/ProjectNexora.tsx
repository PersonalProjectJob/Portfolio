import React, { useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useT } from '../i18n/useT';

const ArrowRightIcon = ({ className }: { className?: string }) => (
   <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const FlowIcon = ({ className }: { className?: string }) => (
   <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/><line x1="17" x2="17" y1="3" y2="13"/><line x1="7" x2="7" y1="11" y2="21"/></svg>
);
const CheckCircleIcon = ({ className }: { className?: string }) => (
   <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 9h3.5a3.5 3.5 0 1 1 0 7H12V9z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>
);

type PaymentStateId = 'amount' | 'method' | 'processing' | 'success' | 'failure';

const paymentStates: Array<{
   id: PaymentStateId;
   label: string;
   eyebrow: string;
   description: string;
}> = [
   { id: 'amount', label: 'Amount', eyebrow: '01 · Input', description: 'Suggested amounts reduce effort while a custom amount keeps the flow flexible.' },
   { id: 'method', label: 'Method', eyebrow: '02 · Decision', description: 'The total remains visible while the customer chooses a familiar payment method.' },
   { id: 'processing', label: 'Processing', eyebrow: '03 · Feedback', description: 'A focused waiting state prevents duplicate taps and explains what the system is doing.' },
   { id: 'success', label: 'Success', eyebrow: '04 · Resolution', description: 'A clear confirmation closes the loop and shows exactly where the tip is going.' },
   { id: 'failure', label: 'Failure', eyebrow: '05 · Recovery', description: 'The flow preserves the amount and offers a direct recovery path instead of a dead end.' },
];

const coreJourneys = [
   {
      role: 'Merchant',
      title: 'Set up a touchpoint',
      outcome: 'Ready to receive tips',
      accent: 'text-violet-500',
      badge: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
      line: 'bg-violet-500/30',
      steps: ['Dashboard', 'Touchpoints', 'Select item', 'Edit state', 'Save'],
   },
   {
      role: 'Customer',
      title: 'Tip or leave a review',
      outcome: 'Payment confirmed',
      accent: 'text-amber-500',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      line: 'bg-amber-500/30',
      steps: ['Scan QR', 'Public profile', 'Choose action', 'Submit', 'Result'],
   },
   {
      role: 'Staff',
      title: 'Receive and manage payouts',
      outcome: 'Payout status visible',
      accent: 'text-emerald-500',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      line: 'bg-emerald-500/30',
      steps: ['Sign in', 'Earnings', 'Payouts', 'Payment detail', 'Status'],
   },
];

const coverageMetrics = [
   { value: '40', label: 'Captured frames', detail: '20 desktop + 20 mobile', color: 'text-violet-500', surface: 'bg-violet-500/10 border-violet-500/20' },
   { value: '12', label: 'Staff route states', detail: 'Verified on staging', color: 'text-emerald-500', surface: 'bg-emerald-500/10 border-emerald-500/20' },
   { value: '6', label: 'Public / auth screens', detail: 'Both breakpoints', color: 'text-cyan-500', surface: 'bg-cyan-500/10 border-cyan-500/20' },
   { value: '4', label: 'Overlay / modal frames', detail: 'Desktop + mobile', color: 'text-amber-500', surface: 'bg-amber-500/10 border-amber-500/20' },
];

const StateGlyph = ({ state }: { state: PaymentStateId }) => {
   if (state === 'processing') {
      return <span className="block h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />;
   }

   if (state === 'failure') {
      return (
         <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
         </svg>
      );
   }

   return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
         <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
   );
};

const TouchPaymentScreen = ({ activeState }: { activeState: PaymentStateId }) => {
   const activeStep = activeState === 'amount' ? 0 : activeState === 'method' ? 1 : 2;

   return (
      <div className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7f7fb] text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
         <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center gap-2">
               <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5b45f6] text-sm font-black text-white">N</span>
               <div>
                  <p className="text-[10px] font-black tracking-[0.18em] text-slate-900">NEXORA TOUCH</p>
                  <p className="text-[10px] text-slate-500">Luxe Nail Spa</p>
               </div>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">Secure checkout</span>
         </div>

         <div className="px-5 pb-6 pt-5 sm:px-7">
            <div className="mb-6 flex items-start justify-between">
               {['Amount', 'Payment', 'Status'].map((step, index) => (
                  <React.Fragment key={step}>
                     <div className="flex min-w-14 flex-col items-center gap-2 text-center">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-colors ${index <= activeStep ? 'bg-[#5b45f6] text-white' : 'bg-slate-200 text-slate-500'}`}>
                           {index < activeStep ? '✓' : index + 1}
                        </span>
                        <span className={`text-[10px] font-bold ${index <= activeStep ? 'text-[#5b45f6]' : 'text-slate-400'}`}>{step}</span>
                     </div>
                     {index < 2 && <span className={`mt-3.5 h-px flex-1 ${index < activeStep ? 'bg-[#5b45f6]' : 'bg-slate-200'}`} />}
                  </React.Fragment>
               ))}
            </div>

            <AnimatePresence mode="wait">
               <motion.div
                  key={activeState}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="min-h-[330px]"
               >
                  {activeState === 'amount' && (
                     <div>
                        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#5b45f6]">Show your appreciation</p>
                        <h5 className="mb-6 text-center text-2xl font-black tracking-tight">Choose a tip amount</h5>
                        <div className="mb-4 grid grid-cols-3 gap-3">
                           {['$5', '$10', '$20'].map((amount, index) => (
                              <button key={amount} type="button" className={`rounded-2xl border px-3 py-5 text-lg font-black transition-transform hover:-translate-y-0.5 ${index === 1 ? 'border-[#5b45f6] bg-[#5b45f6] text-white shadow-lg shadow-violet-500/20' : 'border-slate-200 bg-white text-slate-700'}`}>
                                 {amount}
                              </button>
                           ))}
                        </div>
                        <button type="button" className="mb-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">Enter a custom amount</button>
                        <button type="button" className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">Continue with $10</button>
                     </div>
                  )}

                  {activeState === 'method' && (
                     <div>
                        <div className="mb-6 rounded-2xl bg-violet-50 p-4 text-center">
                           <p className="text-xs font-bold text-violet-600">Tip total</p>
                           <p className="mt-1 text-3xl font-black text-slate-950">$10.00</p>
                        </div>
                        <h5 className="mb-4 text-xl font-black tracking-tight">Choose how to pay</h5>
                        <div className="space-y-3">
                           {['Apple Pay', 'Credit or debit card', 'Cash App Pay'].map((method, index) => (
                              <button key={method} type="button" className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-sm font-black ${index === 0 ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                                 {method}<span aria-hidden="true">→</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeState === 'processing' && (
                     <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <StateGlyph state="processing" />
                        <h5 className="mt-6 text-2xl font-black tracking-tight">Securing your tip</h5>
                        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">Keep this window open. We’re confirming your $10.00 payment.</p>
                        <div className="mt-8 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-500">
                           <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" /> Usually takes a few seconds
                        </div>
                     </div>
                  )}

                  {activeState === 'success' && (
                     <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><StateGlyph state="success" /></div>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Payment confirmed</p>
                        <h5 className="mt-2 text-2xl font-black tracking-tight">You made their day.</h5>
                        <p className="mt-3 max-w-[290px] text-sm leading-relaxed text-slate-500">Your $10.00 tip is on its way to Alex at Luxe Nail Spa.</p>
                        <button type="button" className="mt-7 rounded-2xl bg-slate-950 px-7 py-3 text-sm font-black text-white">Done</button>
                     </div>
                  )}

                  {activeState === 'failure' && (
                     <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600"><StateGlyph state="failure" /></div>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-rose-600">Payment not completed</p>
                        <h5 className="mt-2 text-2xl font-black tracking-tight">Your tip is still saved.</h5>
                        <p className="mt-3 max-w-[290px] text-sm leading-relaxed text-slate-500">No charge was made. Try again or choose another payment method.</p>
                        <div className="mt-7 flex w-full gap-3">
                           <button type="button" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">Change method</button>
                           <button type="button" className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Try again</button>
                        </div>
                     </div>
                  )}
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
   );
};

export const ProjectNexora: React.FC = () => {
   const { isLightMode, setGameState } = useStore();
   const [activePaymentState, setActivePaymentState] = useState<PaymentStateId>('amount');
   const { scrollY } = useScroll();
   const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
   const opacity = useTransform(scrollY, [0, 300], [1, 0]);
   const t = useT();

   const theme = {
      text: isLightMode ? 'text-slate-900' : 'text-white',
      textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
      bgCard: isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-white/10',
      accent: 'text-amber-500',
      bgAccent: 'bg-amber-500',
      gradientText: 'bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent',
   };

   const fadeInUp = {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
   };

   return (
      <CaseStudyLayout>
         {/* HERO SECTION */}
         <section className="relative min-h-screen flex items-center justify-center pb-12 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
               <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-b ${isLightMode ? 'from-amber-50/50 to-transparent' : 'from-amber-900/10 to-transparent'}`}></div>
               <motion.div style={{ y: y1 }} className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-amber-500/10 blur-[120px] mix-blend-screen"></motion.div>
               <motion.div style={{ y: y1 }} className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[100px] mix-blend-screen"></motion.div>
            </div>

            <div className="container relative z-10 mx-auto flex flex-col items-center">
               <motion.div style={{ opacity }} className="text-center max-w-4xl mx-auto mb-16">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-8">
                     <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                     {t('nexora.hero.tag')}
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 ${theme.text}`}>
                     {t('nexora.hero.title')} <br/>
                     <span className={theme.gradientText}>{t('nexora.hero.subtitle')}</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className={`text-lg md:text-xl md:leading-relaxed ${theme.textMuted} max-w-2xl mx-auto`}>
                     {t('nexora.hero.desc')}
                  </motion.p>
               </motion.div>

               {/* Key Meta Info */}
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-5xl p-8 rounded-3xl backdrop-blur-xl border ${theme.bgCard} shadow-2xl`}>
                  <div><p className={`text-xs uppercase tracking-widest font-bold mb-2 ${theme.textMuted}`}>{t('nexora.meta.role.label')}</p><p className={`font-semibold ${theme.text}`}>{t('nexora.meta.role.value')}</p></div>
                  <div><p className={`text-xs uppercase tracking-widest font-bold mb-2 ${theme.textMuted}`}>{t('nexora.meta.platform.label')}</p><p className={`font-semibold ${theme.text}`}>{t('nexora.meta.platform.value')}</p></div>
                  <div><p className={`text-xs uppercase tracking-widest font-bold mb-2 ${theme.textMuted}`}>{t('nexora.meta.method.label')}</p><p className={`font-semibold ${theme.text}`}>{t('nexora.meta.method.value')}</p></div>
                  <div><p className={`text-xs uppercase tracking-widest font-bold mb-2 ${theme.textMuted}`}>{t('nexora.meta.tool.label')}</p><p className={`font-semibold ${theme.text}`}>{t('nexora.meta.tool.value')}</p></div>
               </motion.div>
            </div>
         </section>

         <div className="container mx-auto pb-20 md:pb-32">
            
            {/* 01. THE CONTEXT */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="py-16 md:py-24 border-t border-slate-200 dark:border-white/10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                     <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">{t('nexora.context.tag')}</h2>
                     <h3 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>{t('nexora.context.title')}</h3>
                  </div>
                  <div className="lg:col-span-8">
                     <p className={`text-lg leading-relaxed ${theme.textMuted} mb-8`}>
                        {t('nexora.context.desc')}
                     </p>
                     <div className={`p-8 rounded-3xl border ${theme.bgCard} shadow-lg border-l-4 border-l-red-500`}>
                        <h4 className={`text-xl font-bold mb-4 flex items-center gap-3 text-red-500`}>
                           {t('nexora.context.challenge.title')}
                        </h4>
                        <ul className={`leading-relaxed ${theme.textMuted} space-y-2 list-disc pl-5`}>
                           <li>{t('nexora.context.challenge.list.0')}</li>
                           <li>{t('nexora.context.challenge.list.1')}</li>
                           <li>{t('nexora.context.challenge.list.2')}</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* 02. DISCOVERY & STRATEGY */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="py-16 md:py-24 border-t border-slate-200 dark:border-white/10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                     <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">{t('nexora.strategy.tag')}</h2>
                     <h3 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>{t('nexora.strategy.title')}</h3>
                  </div>
                  <div className="lg:col-span-8">
                     <p className={`text-lg leading-relaxed ${theme.textMuted} mb-8`} dangerouslySetInnerHTML={{ __html: t('nexora.strategy.desc') }}></p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${theme.bgCard}`}>
                           <h4 className={`font-bold mb-3 ${theme.text} flex items-center gap-2`}><CheckCircleIcon className="text-amber-500 w-5 h-5"/> {t('nexora.strategy.map.title')}</h4>
                           <p className={`text-sm ${theme.textMuted}`}>{t('nexora.strategy.map.desc')}</p>
                        </div>
                        <div className={`p-6 rounded-2xl border ${theme.bgCard}`}>
                           <h4 className={`font-bold mb-3 ${theme.text} flex items-center gap-2`}><CheckCircleIcon className="text-amber-500 w-5 h-5"/> {t('nexora.strategy.modular.title')}</h4>
                           <p className={`text-sm ${theme.textMuted}`}>{t('nexora.strategy.modular.desc')}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* 03. ARCHITECTURE & UX */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="py-16 md:py-24 border-t border-slate-200 dark:border-white/10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                     <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">{t('nexora.architecture.tag')}</h2>
                     <h3 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>{t('nexora.architecture.title')}</h3>
                  </div>
                  <div className="lg:col-span-8">
                     <p className={`text-lg leading-relaxed ${theme.textMuted}`}>
                        {t('nexora.architecture.desc')}
                     </p>
                  </div>
               </div>

               <div className={`mt-12 overflow-hidden rounded-[2rem] border ${isLightMode ? 'border-slate-200 bg-white shadow-xl shadow-slate-200/60' : 'border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20'}`}>
                  <div className="bg-[#0b1f4d] p-5 sm:p-7">
                     <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{t('nexora.architecture.system.tag')}</p>
                           <h4 className="mt-1 text-xl font-black text-white">{t('nexora.architecture.system.title')}</h4>
                        </div>
                        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-300 sm:inline">{t('nexora.architecture.system.badge')}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[
                           ['01', 'Role', 'Merchant · Staff · Customer'],
                           ['02', 'Entry', 'Login · QR · Invite'],
                           ['03', 'Workspace', 'Dashboard · Earnings'],
                           ['04', 'Task', 'Manage · Pay · Review'],
                           ['05', 'State', 'Loading · Empty · Error'],
                        ].map(([number, label, detail], index) => (
                           <div key={label} className={`relative rounded-2xl border border-white/10 bg-white/[0.07] p-4 ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                              <span className="text-[10px] font-black text-amber-300">{number}</span>
                              <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-white">{label}</p>
                              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{detail}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3 p-4 sm:p-6">
                     {coreJourneys.map((journey) => (
                        <article key={journey.role} className={`rounded-2xl border p-4 sm:p-5 ${isLightMode ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/[0.03]'}`}>
                           <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                              <div className="lg:w-[210px] lg:shrink-0">
                                 <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${journey.badge}`}>{journey.role}</span>
                                 <h5 className={`mt-2 text-sm font-black ${theme.text}`}>{journey.title}</h5>
                              </div>
                              <div className="hide-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto pb-1">
                                 {journey.steps.map((step, index) => (
                                    <React.Fragment key={step}>
                                       <div className={`min-w-[112px] rounded-xl border px-3 py-3 text-center text-xs font-bold ${isLightMode ? 'border-slate-200 bg-white text-slate-700' : 'border-white/10 bg-slate-900 text-slate-200'}`}>
                                          <span className={`mb-1 block text-[11px] font-black ${journey.accent}`}>0{index + 1}</span>
                                          {step}
                                       </div>
                                       {index < journey.steps.length - 1 && <span className={`h-px min-w-5 flex-1 ${journey.line}`} />}
                                    </React.Fragment>
                                 ))}
                              </div>
                              <div className={`flex items-center gap-2 text-xs font-black lg:w-[150px] lg:justify-end ${journey.accent}`}>
                                 <CheckCircleIcon className="h-4 w-4" /> {journey.outcome}
                              </div>
                           </div>
                        </article>
                     ))}
                  </div>
               </div>
            </motion.section>

            {/* 04. DESIGN & EXECUTION */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="py-16 md:py-24 border-t border-slate-200 dark:border-white/10">
               <div className="text-center mb-16">
                  <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">{t('nexora.design.tag')}</h2>
                  <h3 className={`text-4xl md:text-5xl font-black tracking-tighter ${theme.text}`}>{t('nexora.design.title')}</h3>
                  <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme.textMuted}`}>
                     {t('nexora.design.desc')}
                  </p>
               </div>

               <div className="space-y-28">
                  {/* Design 1: The General Layout */}
                  <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                     <div className="w-full md:w-3/5 order-2 md:order-1 relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className={`relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/10] ${isLightMode ? 'bg-slate-100 border border-slate-300' : 'bg-slate-900 border border-white/10'}`}>
                           <img src="/images/case-study/nexora_hero.png" alt="Nexora Dashboard UI" className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-1000 group-hover:scale-105" />
                        </div>
                     </div>
                     <div className="w-full md:w-2/5 order-1 md:order-2">
                        <h4 className={`text-2xl font-bold mb-4 ${theme.text}`}>{t('nexora.design.dashboard.title')}</h4>
                        <p className={`text-lg ${theme.textMuted} leading-relaxed mb-6`}>
                           {t('nexora.design.dashboard.desc')}
                        </p>
                        <ul className={`space-y-3 ${theme.textMuted}`}>
                           <li className="flex items-start gap-2"><FlowIcon className="text-amber-500 shrink-0 mt-1"/> {t('nexora.design.dashboard.list.0')}</li>
                           <li className="flex items-start gap-2"><FlowIcon className="text-amber-500 shrink-0 mt-1"/> {t('nexora.design.dashboard.list.1')}</li>
                        </ul>
                     </div>
                  </div>

                  {/* Design 2: Interactive state lab */}
                  <div>
                     <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7">
                           <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-violet-500">{t('nexora.design.lab.tag')}</p>
                           <h4 className={`text-3xl font-black tracking-tight md:text-4xl ${theme.text}`}>{t('nexora.design.lab.title')}</h4>
                        </div>
                        <p className={`text-base leading-relaxed lg:col-span-5 ${theme.textMuted}`}>
                           {t('nexora.design.lab.desc')}
                        </p>
                     </div>

                     <div className={`relative overflow-hidden rounded-[2rem] border p-4 sm:p-7 lg:p-9 ${isLightMode ? 'border-slate-200 bg-gradient-to-br from-white to-violet-50/60 shadow-2xl shadow-violet-200/40' : 'border-white/10 bg-gradient-to-br from-[#101022] to-[#090914] shadow-2xl shadow-black/30'}`}>
                        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/15 blur-[90px]" />
                        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                           <div className="lg:col-span-5">
                              <div className="flex items-center justify-between gap-4">
                                 <div>
                                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${theme.textMuted}`}>{t('nexora.design.lab.select')}</p>
                                    <p className={`mt-2 text-sm ${theme.textMuted}`}>{t('nexora.design.lab.preview')}</p>
                                 </div>
                                 <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-500">{t('nexora.design.lab.interactive')}</span>
                              </div>

                              <div className="mt-6 space-y-2" role="tablist" aria-label="Customer payment states">
                                 {paymentStates.map((state) => {
                                    const isActive = state.id === activePaymentState;
                                    return (
                                       <button
                                          key={state.id}
                                          type="button"
                                          role="tab"
                                          aria-selected={isActive}
                                          aria-label={`${state.eyebrow}: ${state.label}`}
                                          onClick={() => setActivePaymentState(state.id)}
                                          className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${isActive ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/20' : isLightMode ? 'border-slate-200 bg-white/80 hover:border-violet-300 hover:bg-white' : 'border-white/10 bg-white/[0.04] hover:border-violet-500/40 hover:bg-white/[0.07]'}`}
                                       >
                                          <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${isActive ? 'bg-white/15 text-white' : 'bg-violet-500/10 text-violet-500'}`}>
                                             {String(paymentStates.indexOf(state) + 1).padStart(2, '0')}
                                          </span>
                                          <span className="min-w-0 flex-1">
                                             <span className={`block text-[11px] font-black uppercase tracking-[0.16em] ${isActive ? 'text-violet-100' : theme.textMuted}`}>{state.eyebrow}</span>
                                             <span className={`mt-1 block text-sm font-black ${isActive ? 'text-white' : theme.text}`}>{state.label}</span>
                                          </span>
                                          <ArrowRightIcon className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-white' : 'text-violet-500'}`} />
                                       </button>
                                    );
                                 })}
                              </div>

                              <AnimatePresence mode="wait">
                                 <motion.p
                                    key={activePaymentState}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`mt-5 text-sm leading-relaxed ${theme.textMuted}`}
                                 >
                                    {paymentStates.find((state) => state.id === activePaymentState)?.description}
                                 </motion.p>
                              </AnimatePresence>

                              <div className={`mt-6 border-t pt-5 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                                 <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.16em] ${theme.textMuted}`}>{t('nexora.design.lab.systemBehaviors')}</p>
                                 <div className="flex flex-wrap gap-2">
                                    {['Loading', 'Error & guards', 'Empty state', 'Toast', 'Tooltip'].map((behavior) => (
                                       <span key={behavior} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${isLightMode ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'}`}>{behavior}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-center lg:col-span-7">
                              <TouchPaymentScreen activeState={activePaymentState} />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Verified design coverage */}
                  <div>
                     <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                           <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-amber-500">{t('nexora.design.coverage.tag')}</p>
                           <h4 className={`text-2xl font-black ${theme.text}`}>{t('nexora.design.coverage.title')}</h4>
                        </div>
                        <p className={`max-w-xl text-sm leading-relaxed ${theme.textMuted}`}>{t('nexora.design.coverage.desc')}</p>
                     </div>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {coverageMetrics.map((metric) => (
                           <div key={metric.label} className={`rounded-2xl border p-5 ${metric.surface}`}>
                              <p className={`text-4xl font-black tracking-tight ${metric.color}`}>{metric.value}</p>
                              <p className={`mt-3 text-sm font-black ${theme.text}`}>{metric.label}</p>
                              <p className={`mt-1 text-xs ${theme.textMuted}`}>{metric.detail}</p>
                           </div>
                        ))}
                     </div>

                     <div className="mt-8 text-center">
                        <a
                           href="https://www.figma.com/design/Y6WpL0AO5dWex3fCC0TqJl/Nexora?node-id=462-113&t=Oz5usdksmtTeMDNA-1"
                           target="_blank"
                           rel="noopener noreferrer"
                           className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${isLightMode ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/30' : 'border border-amber-500/30 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
                        >
                           <FigmaIcon className="h-5 w-5" />
                           {t('nexora.design.figma')}
                        </a>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* 05. OUTCOMES & RETROSPECTIVE */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="py-16 md:py-24 border-t border-slate-200 dark:border-white/10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4">
                     <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">{t('nexora.outcomes.tag')}</h2>
                     <h3 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>{t('nexora.outcomes.title')}</h3>
                  </div>
                  <div className="lg:col-span-8">
                     <div className={`p-8 md:p-12 rounded-3xl border bg-gradient-to-br ${isLightMode ? 'from-amber-50 to-emerald-50 border-amber-100' : 'from-amber-900/20 to-emerald-900/20 border-amber-500/20'} shadow-lg mb-8`}>
                        <p className={`text-xl italic font-medium leading-relaxed ${theme.text} mb-8`}>
                           {t('nexora.outcomes.quote')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-emerald-500 mb-2">{t('nexora.outcomes.stat1.value')}</div>
                              <div className={`text-xs font-bold uppercase tracking-widest ${theme.text} mb-1`}>{t('nexora.outcomes.stat1.label')}</div>
                              <p className={`text-sm ${theme.textMuted}`}>{t('nexora.outcomes.stat1.desc')}</p>
                           </div>
                           <div>
                              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-emerald-500 mb-2">{t('nexora.outcomes.stat2.value')}</div>
                              <div className={`text-xs font-bold uppercase tracking-widest ${theme.text} mb-1`}>{t('nexora.outcomes.stat2.label')}</div>
                              <p className={`text-sm ${theme.textMuted}`}>{t('nexora.outcomes.stat2.desc')}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* Next Project CTA */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="pt-16 md:pt-24 border-t border-slate-200 dark:border-white/10 text-center">
               <button onClick={() => setGameState('CASE_STUDY_VLINKPAY')} className={`inline-flex items-center gap-4 text-2xl md:text-4xl font-black uppercase tracking-tighter ${theme.text} hover:text-amber-500 transition-colors group cursor-pointer`}>
                  {t('nexora.nextProject')} 
                  <ArrowRightIcon className="w-8 h-8 md:w-10 md:h-10 transform group-hover:translate-x-4 transition-transform duration-300" />
               </button>
            </motion.div>

         </div>
      </CaseStudyLayout>
   );
};
