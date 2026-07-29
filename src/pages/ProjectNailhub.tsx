import React, { useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useT } from '../i18n/useT';

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 9h3.5a3.5 3.5 0 1 1 0 7H12V9z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>
);

type RoleId = 'owner' | 'technician' | 'buyer';

const nailhubRoles: Array<{
  id: RoleId;
  label: string;
  title: string;
  need: string;
  outcome: string;
  accent: string;
  activeSurface: string;
  softSurface: string;
  steps: string[];
}> = [
  {
    id: 'owner',
    label: 'Salon owner',
    title: 'Hire and grow the team',
    need: 'Post a role, explain the opportunity and review suitable technicians.',
    outcome: 'A qualified conversation starts',
    accent: 'text-teal-500',
    activeSurface: 'border-teal-500 bg-teal-500 text-white shadow-teal-500/20',
    softSurface: 'border-teal-500/20 bg-teal-500/10',
    steps: ['Post need', 'Add requirements', 'Review candidates', 'Contact', 'Manage status'],
  },
  {
    id: 'technician',
    label: 'Nail technician',
    title: 'Find the right opportunity',
    need: 'Search by role and location, evaluate the salon and make contact.',
    outcome: 'A relevant application is sent',
    accent: 'text-sky-500',
    activeSurface: 'border-sky-500 bg-sky-500 text-white shadow-sky-500/20',
    softSurface: 'border-sky-500/20 bg-sky-500/10',
    steps: ['Search roles', 'Filter location', 'Review salon', 'Apply / contact', 'Track status'],
  },
  {
    id: 'buyer',
    label: 'Buyer / operator',
    title: 'Discover a salon opportunity',
    need: 'Compare transfer listings, inspect the business and contact the owner.',
    outcome: 'A serious inquiry is created',
    accent: 'text-amber-500',
    activeSurface: 'border-amber-500 bg-amber-500 text-white shadow-amber-500/20',
    softSurface: 'border-amber-500/20 bg-amber-500/10',
    steps: ['Browse salons', 'Filter market', 'Review listing', 'Contact owner', 'Manage inquiry'],
  },
];

const productDecisions = [
  {
    number: '01',
    label: 'Intent before inventory',
    title: 'Search begins with a real-world goal',
    description: 'Listing type and location filters narrow the marketplace before users spend time comparing individual cards.',
    color: 'text-teal-500',
    surface: 'border-teal-500/20 bg-teal-500/10',
  },
  {
    number: '02',
    label: 'Scannable evaluation',
    title: 'Each card answers the next decision',
    description: 'Role, location, compensation, imagery and engagement cues are ordered to support fast comparison without hiding detail.',
    color: 'text-sky-500',
    surface: 'border-sky-500/20 bg-sky-500/10',
  },
  {
    number: '03',
    label: 'Continuity across roles',
    title: 'Discovery connects to management',
    description: 'Authentication, detail, contact and listing management remain part of one role-aware system instead of isolated screens.',
    color: 'text-amber-500',
    surface: 'border-amber-500/20 bg-amber-500/10',
  },
];

export const ProjectNailhub: React.FC = () => {
  const { isLightMode, setGameState } = useStore();
  const [activeRole, setActiveRole] = useState<RoleId>('technician');
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 340], [1, 0]);
  const selectedRole = nailhubRoles.find((role) => role.id === activeRole) ?? nailhubRoles[1];
  const t = useT();

  const theme = {
    text: isLightMode ? 'text-slate-900' : 'text-white',
    textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
    card: isLightMode ? 'border-slate-200 bg-white/90' : 'border-white/10 bg-slate-900/55',
    divider: isLightMode ? 'border-slate-200' : 'border-white/10',
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
  };

  return (
    <CaseStudyLayout>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-b ${isLightMode ? 'from-[#fff8f3] via-slate-50 to-transparent' : 'from-[#2a1716]/45 via-[#07151a]/25 to-transparent'}`} />
          <motion.div style={{ y: backgroundY }} className="absolute -right-[15%] -top-[25%] h-[65vw] w-[65vw] rounded-full bg-[#c98d72]/15 blur-[120px]" />
          <motion.div style={{ y: backgroundY }} className="absolute -left-[15%] top-[35%] h-[50vw] w-[50vw] rounded-full bg-teal-500/10 blur-[110px]" />
        </div>

        <div className="container relative z-10 mx-auto">
          <motion.div style={{ opacity: heroOpacity }} className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-500">
              <span className="h-2 w-2 rounded-full bg-teal-500" /> {t('nailhub.hero.tag')}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={`text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl ${theme.text}`}>
              {t('nailhub.hero.title')}<br />
              <span className="bg-gradient-to-r from-[#c98d72] via-rose-400 to-teal-500 bg-clip-text text-transparent">{t('nailhub.hero.subtitle')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className={`mx-auto mt-7 max-w-2xl text-lg leading-relaxed md:text-xl ${theme.textMuted}`}>
              {t('nailhub.hero.desc')}
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className={`mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-5 rounded-3xl border p-6 backdrop-blur-xl md:grid-cols-4 md:p-8 ${theme.card}`}>
            {[
              [t('nailhub.meta.role.label'), t('nailhub.meta.role.value')],
              [t('nailhub.meta.platform.label'), t('nailhub.meta.platform.value')],
              [t('nailhub.meta.domain.label'), t('nailhub.meta.domain.value')],
              [t('nailhub.meta.method.label'), t('nailhub.meta.method.value')],
            ].map(([label, value]) => (
              <div key={label}>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${theme.textMuted}`}>{label}</p>
                <p className={`mt-2 text-sm font-bold ${theme.text}`}>{value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className={`relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl ${isLightMode ? 'border-slate-200 bg-white shadow-rose-200/40' : 'border-white/10 bg-slate-950 shadow-black/30'}`}>
            <div className={`flex items-center gap-2 border-b px-5 py-3 ${theme.divider}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <span className={`ml-3 text-[10px] font-bold ${theme.textMuted}`}>{t('nailhub.mockup.tag')}</span>
            </div>
            <img src="/images/case-study/nailhub_search_flow.png" alt={t('nailhub.mockup.alt')} className="aspect-[16/9] w-full object-cover object-top" />
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto pb-20 md:pb-32">
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className={`border-t py-16 md:py-24 ${theme.divider}`}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-teal-500">{t('nailhub.context.tag')}</p>
              <h2 className={`text-3xl font-black tracking-tight md:text-4xl ${theme.text}`}>{t('nailhub.context.title')}</h2>
            </div>
            <div className="lg:col-span-8">
              <p className={`text-lg leading-relaxed ${theme.textMuted}`}>
                {t('nailhub.context.desc')}
              </p>
              <div className={`mt-8 rounded-3xl border p-7 ${theme.card}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c98d72]">{t('nailhub.context.challenge.tag')}</p>
                <p className={`mt-3 text-xl font-bold leading-relaxed ${theme.text}`}>
                  {t('nailhub.context.challenge.text')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className={`border-t py-16 md:py-24 ${theme.divider}`}>
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-teal-500">{t('nailhub.roles.tag')}</p>
              <h2 className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}>{t('nailhub.roles.title')}</h2>
            </div>
            <p className={`lg:col-span-5 ${theme.textMuted}`}>{t('nailhub.roles.desc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" role="tablist" aria-label="Nailhub user roles">
            {nailhubRoles.map((role) => {
              const isActive = role.id === activeRole;
              return (
                <button key={role.id} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveRole(role.id)} className={`rounded-2xl border p-5 text-left transition-all duration-200 ${isActive ? `${role.activeSurface} shadow-xl` : `${theme.card} hover:-translate-y-1`}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.17em] ${isActive ? 'text-white/75' : role.accent}`}>{t(`nailhub.role.${role.id}.label`)}</p>
                  <p className={`mt-3 text-lg font-black ${isActive ? 'text-white' : theme.text}`}>{t(`nailhub.role.${role.id}.title`)}</p>
                  <p className={`mt-3 text-sm leading-relaxed ${isActive ? 'text-white/80' : theme.textMuted}`}>{t(`nailhub.role.${role.id}.need`)}</p>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeRole} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className={`mt-6 overflow-hidden rounded-[2rem] border ${theme.card}`}>
              <div className={`flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center ${theme.divider}`}>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.16em] ${selectedRole.accent}`}>{t('nailhub.journey.primary')}{t(`nailhub.role.${selectedRole.id}.label`)}</p>
                  <h3 className={`mt-2 text-2xl font-black ${theme.text}`}>{t(`nailhub.role.${selectedRole.id}.title`)}</h3>
                </div>
                <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${selectedRole.softSurface} ${selectedRole.accent}`}>
                  <CheckCircleIcon className="h-4 w-4" /> {t(`nailhub.role.${selectedRole.id}.outcome`)}
                </div>
              </div>
              <div className="hide-scrollbar flex items-center overflow-x-auto p-6 sm:p-8">
                {selectedRole.steps.map((_, index) => (
                  <React.Fragment key={index}>
                    <div className={`min-w-[145px] rounded-2xl border p-4 text-center ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.04]'}`}>
                      <span className={`text-[10px] font-black ${selectedRole.accent}`}>0{index + 1}</span>
                      <p className={`mt-2 text-sm font-bold ${theme.text}`}>{t(`nailhub.role.${selectedRole.id}.steps.${index}`)}</p>
                    </div>
                    {index < selectedRole.steps.length - 1 && <ArrowRightIcon className={`mx-2 h-4 w-4 shrink-0 ${selectedRole.accent}`} />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={`mt-6 rounded-2xl border p-5 ${theme.card}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${theme.textMuted}`}>{t('nailhub.system.tag')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((itemIndex) => (
                <span key={itemIndex} className={`rounded-full border px-3 py-2 text-[10px] font-bold ${isLightMode ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300'}`}>{t(`nailhub.system.item.${itemIndex}`)}</span>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className={`border-t py-16 md:py-24 ${theme.divider}`}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#c98d72]">{t('nailhub.decisions.tag')}</p>
            <h2 className={`text-4xl font-black tracking-tight md:text-5xl ${theme.text}`}>{t('nailhub.decisions.title')}</h2>
          </div>

          <div className={`overflow-hidden rounded-[2rem] border shadow-2xl ${theme.card}`}>
            <div className={`flex items-center gap-2 border-b px-5 py-3 ${theme.divider}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <span className={`ml-3 text-[10px] font-bold ${theme.textMuted}`}>{t('nailhub.decisions.mockup.tag')}</span>
            </div>
            <div className="relative bg-white">
              <img src="/images/case-study/nailhub_search_flow.png" alt={t('nailhub.decisions.mockup.alt')} className="aspect-[16/9] w-full object-cover object-top" />
              <div className="absolute left-[16%] top-[12%] hidden rounded-full border border-white/30 bg-slate-950/80 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">{t('nailhub.decisions.mockup.tooltip1')}</div>
              <div className="absolute left-[16%] top-[28%] hidden rounded-full border border-white/30 bg-teal-600/90 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">{t('nailhub.decisions.mockup.tooltip2')}</div>
              <div className="absolute right-[14%] top-[48%] hidden rounded-full border border-white/30 bg-[#b66f52]/90 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">{t('nailhub.decisions.mockup.tooltip3')}</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {productDecisions.map((decision, index) => (
              <article key={decision.number} className={`rounded-3xl border p-6 ${theme.card}`}>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black ${decision.surface} ${decision.color}`}>{decision.number}</div>
                <p className={`mt-5 text-[10px] font-black uppercase tracking-[0.17em] ${decision.color}`}>{t(`nailhub.decision.${index}.label`)}</p>
                <h3 className={`mt-2 text-xl font-black ${theme.text}`}>{t(`nailhub.decision.${index}.title`)}</h3>
                <p className={`mt-4 text-sm leading-relaxed ${theme.textMuted}`}>{t(`nailhub.decision.${index}.description`)}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeInUp} className={`border-t py-16 md:py-24 ${theme.divider}`}>
          <div className={`relative overflow-hidden rounded-[2rem] border shadow-2xl mx-auto max-w-5xl ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
            <div className="absolute inset-0 z-0">
              <img src="/images/case-study/nailhub_figma_teaser.jpg" alt="Nailhub Figma System" className="w-full h-full object-cover opacity-60 dark:opacity-40" />
              <div className={`absolute inset-0 bg-gradient-to-t ${isLightMode ? 'from-white/95 via-white/80 to-white/10' : 'from-slate-950/95 via-slate-950/80 to-slate-950/10'}`}></div>
            </div>
            
            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center flex flex-col items-center justify-center">
              <h2 className={`text-3xl md:text-5xl font-black tracking-tight mb-4 ${theme.text}`}>{t('nailhub.figma.title')}</h2>
              <p className={`text-sm md:text-lg max-w-2xl leading-relaxed mb-8 font-medium ${theme.textMuted}`}>{t('nailhub.figma.desc')}</p>
              
              <a href="https://www.figma.com/design/OjcQOoxXKckjMZT6DqQ6TN/The-Nail-Hub?node-id=959-17584&t=xnd33yPz496FwEgE-1" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-3 rounded-xl px-8 py-4 font-black transition-all hover:scale-105 shadow-xl ${isLightMode ? 'bg-[#0d9488] text-white shadow-teal-500/25 hover:bg-[#0f766e]' : 'bg-teal-500 text-slate-950 shadow-teal-500/20 hover:bg-teal-400'}`}>
                <FigmaIcon className="h-6 w-6" /> {t('nailhub.evidence.figma')}
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};

