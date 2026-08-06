import type { ReactNode } from "react";
import { motion } from 'framer-motion';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';
import { useT } from '../i18n/useT';
import { useStore } from '../store/useStore';

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const decisionTones: Tone[] = ["info", "info", "success", "success", "warning", "neutral"];
const layerQuests: (string | null)[] = ["dispatch", "agent-rules", null];

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeInItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  theme
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  theme: any;
}) {
  return (
    <motion.section 
      id={id} 
      className={`border-t ${theme.sectionBorder} py-16 sm:py-24`}
      whileInView="visible" 
      initial="hidden" 
      viewport={{ once: true, amount: 0.2 }} 
      variants={fadeInUp}
    >
      <div className="w-full">
        <div className="max-w-3xl">
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.eyebrow}`}>
            {eyebrow}
          </p>
          <h2 className={`mt-4 text-3xl font-semibold tracking-tight ${theme.text} sm:text-5xl`}>
            {title}
          </h2>
          {description ? (
            <p className={`mt-5 text-base leading-7 ${theme.textBody} sm:text-lg`}>
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </motion.section>
  );
}

function Stat({ value, label, theme }: { value: string; label: string; theme: any }) {
  return (
    <div className={`border-l ${theme.statBorder} pl-4`}>
      <div className={`text-2xl font-semibold tracking-tight ${theme.text}`}>{value}</div>
      <div className={`mt-1 text-sm leading-5 ${theme.textMuted}`}>{label}</div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div aria-hidden="true" className="hidden items-center justify-center lg:flex">
      <span className="text-2xl text-zinc-300">→</span>
    </div>
  );
}

export default function ProjectSyncTaskBadge() {
  const t = useT();
  const { isLightMode, handleQuestSelect } = useStore();
  const p = (key: string) => t(`sync-task-badge.${key}` as any);

  const theme = {
    text: isLightMode ? 'text-zinc-950' : 'text-zinc-50',
    textMuted: isLightMode ? 'text-zinc-500' : 'text-zinc-400',
    textBody: isLightMode ? 'text-zinc-600' : 'text-zinc-300',
    textStrong: isLightMode ? 'text-zinc-700' : 'text-zinc-200',
    card: isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800',
    cardAlt: isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800',
    border: isLightMode ? 'border-zinc-200' : 'border-zinc-800',
    sectionBorder: isLightMode ? 'border-zinc-200' : 'border-zinc-800/50',
    tableHead: isLightMode ? 'bg-zinc-50 text-zinc-500' : 'bg-zinc-900/50 text-zinc-400',
    statBorder: isLightMode ? 'border-zinc-300' : 'border-zinc-800',
    eyebrow: isLightMode ? 'text-zinc-500' : 'text-zinc-400',
    stepLabel: isLightMode ? 'text-zinc-400' : 'text-zinc-500',
    numberCircle: isLightMode ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-100',
    checkmark: isLightMode ? 'text-emerald-600' : 'text-emerald-400',
  };

  const toneClasses: Record<Tone, string> = {
    neutral: isLightMode ? "border-zinc-200 bg-zinc-50 text-zinc-700" : "border-zinc-700 bg-zinc-500/30 text-zinc-300",
    success: isLightMode ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-700 bg-emerald-500/30 text-emerald-300",
    warning: isLightMode ? "border-amber-200 bg-amber-50 text-amber-800" : "border-amber-700 bg-amber-500/30 text-amber-300",
    danger: isLightMode ? "border-rose-200 bg-rose-50 text-rose-800" : "border-rose-700 bg-rose-500/30 text-rose-300",
    info: isLightMode ? "border-sky-200 bg-sky-50 text-sky-800" : "border-sky-700 bg-sky-500/30 text-sky-300",
  };

  const badgeMap: Record<string, string> = {
    "Code Review": isLightMode ? "border-sky-200 bg-sky-50 text-sky-800" : "border-sky-700 bg-sky-500/30 text-sky-300",
    "Testing": isLightMode ? "border-violet-200 bg-violet-50 text-violet-800" : "border-violet-700 bg-violet-500/30 text-violet-300",
    "Done": isLightMode ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-700 bg-emerald-500/30 text-emerald-300",
    "Re-Open": isLightMode ? "border-amber-200 bg-amber-50 text-amber-800" : "border-amber-700 bg-amber-500/30 text-amber-300",
  };

  const badgeTextColor: Record<string, string> = {
    "Code Review": isLightMode ? "text-sky-700" : "text-sky-400",
    "Testing": isLightMode ? "text-violet-700" : "text-violet-400",
    "Done": isLightMode ? "text-emerald-700" : "text-emerald-400",
    "Re-Open": isLightMode ? "text-amber-700" : "text-amber-400",
  };

  function badgify(text: string) {
    const pattern = new RegExp(`(${Object.keys(badgeTextColor).join("|")})`, "g");
    const parts = text.split(pattern);
    if (parts.length === 1) return text;
    return (
      <>
        {parts.map((part, idx) =>
          badgeTextColor[part] ? (
            <strong key={idx} className={`font-bold ${badgeTextColor[part]}`}>
              {part}
            </strong>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </>
    );
  }

  const cardHoverStyle = `transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isLightMode ? '' : 'hover:shadow-[0_0_15px_rgba(100,100,255,0.08)]'}`;

  return (
    <CaseStudyLayout>
      <main className={`relative z-10 mx-auto max-w-5xl w-full shrink-0 ${theme.text}`}>
      
      <motion.section 
        className="pt-4 pb-16 sm:pb-24 lg:pb-32"
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={fadeInUp}
      >
        <div className="w-full">
          <div className="max-w-4xl">
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.eyebrow}`}>
              {p('eyebrow')}
            </p>
            <h1 className={`mt-5 text-4xl font-semibold tracking-[-0.04em] ${theme.text} sm:text-6xl lg:text-7xl`}>
              {p('headline')}
            </h1>
            <p className={`mt-7 max-w-3xl text-lg leading-8 ${theme.textBody} sm:text-xl`}>
              {p('subheadline')}
            </p>
            <div className="mt-8">
              <a href="https://github.com/PersonalProjectJob/personal-skill-and-plugin/tree/main/skill-principal" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isLightMode ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg' : 'bg-white text-zinc-900 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}>
                View in Repo <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map(i => (
              <Stat key={i} value={p(`stat.${i}.value`)} label={p(`stat.${i}.label`)} theme={theme} />
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-50 sm:p-8">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {[0, 1, 2].map((i) => (
                <div key={i} className="contents">
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={layerQuests[i] ? undefined : '#solution'}
                    onClick={(e) => {
                      const questId = layerQuests[i];
                      if (questId) {
                        e.preventDefault();
                        handleQuestSelect(questId);
                      }
                    }}
                    className="group rounded-2xl border border-white/15 bg-white/[0.04] p-4 transition hover:bg-white/[0.08] sm:p-5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold tracking-[0.18em] text-zinc-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-zinc-300">
                        {p(`layer.${i}.label`)}
                      </span>
                    </div>
                    <h2 className="mt-10 text-2xl font-semibold">{p(`layer.${i}.title`)}</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {p(`layer.${i}.desc`)}
                    </p>
                  </motion.a>
                  {i < 2 ? <FlowConnector /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Bối cảnh tạo ra skill / Why I built this */}
      <Section
        eyebrow={p('context.eyebrow')}
        title={p('context.title')}
        description={p('context.desc')}
        theme={theme}
      >
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-2">
          {/* Workflow comparison */}
          <div className="space-y-8">
            {/* Before */}
            <div className={`rounded-2xl border ${theme.border} p-6 sm:p-8 ${theme.cardAlt}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`}>{p('context.before.title')}</h3>
              <p className={`text-sm leading-6 mb-6 ${theme.textBody}`}>{p('context.before.desc')}</p>
              <div className={`flex flex-wrap items-center gap-2 text-xs font-mono p-4 rounded-xl border ${isLightMode ? 'text-zinc-500 bg-zinc-200/50 border-zinc-300' : 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50'}`}>
                {p('context.flow.before').split('→').map((segment: string, idx: number, arr: string[]) => (
                  <span key={idx} className="contents">
                    <span>{segment.trim()}</span>
                    {idx < arr.length - 1 && <span className="opacity-50">→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* After */}
            <div className={`rounded-2xl border p-6 sm:p-8 ${isLightMode ? 'border-emerald-200 bg-emerald-50/50' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>{p('context.after.title')}</h3>
              <p className={`text-sm leading-6 mb-6 ${theme.textBody}`}>{p('context.after.desc')}</p>
              <div className={`flex flex-wrap items-center gap-2 text-xs font-mono p-4 rounded-xl border ${isLightMode ? 'text-emerald-800 bg-emerald-100/50 border-emerald-200' : 'text-emerald-300 bg-emerald-900/30 border-emerald-800/50'}`}>
                {p('context.flow.after').split('→').map((segment: string, idx: number, arr: string[]) => (
                  <span key={idx} className="contents">
                    <span>{segment.trim()}</span>
                    {idx < arr.length - 1 && <span className="opacity-50">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pain point & Outcome */}
          <div className="flex flex-col space-y-8">
            <div className={`rounded-2xl border ${theme.border} p-6 sm:p-8 ${theme.card}`}>
              <h3 className="text-xl font-semibold mb-4">{p('context.pain.title')}</h3>
              <p className={`text-base leading-7 ${theme.textBody}`}>{p('context.pain.desc')}</p>
            </div>
            
            <div className="rounded-2xl bg-zinc-950 p-8 sm:p-10 text-zinc-100 flex-1 flex flex-col justify-center relative overflow-hidden border border-zinc-800">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl" aria-hidden="true">💡</div>
              <blockquote className="relative z-10 text-xl sm:text-2xl font-medium leading-relaxed tracking-tight">
                "{p('context.outcome')}"
              </blockquote>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow={p('gap.eyebrow')}
        title={p('gap.title')}
        description={p('gap.desc')}
        theme={theme}
      >
        <motion.div 
          className="grid gap-5 md:grid-cols-2"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3].map(i => (
            <motion.article key={i} variants={fadeInItem} className={`rounded-2xl border ${theme.border} p-4 sm:p-6 ${cardHoverStyle}`}>
              <h3 className="text-lg font-semibold">{p(`gap.${i}.title`)}</h3>
              <p className={`mt-3 text-sm leading-6 ${theme.textBody}`}>{p(`gap.${i}.desc`)}</p>
            </motion.article>
          ))}
        </motion.div>
      </Section>

      <Section
        id="solution"
        eyebrow={p('flow.eyebrow')}
        title={p('flow.title')}
        description={p('flow.desc')}
        theme={theme}
      >
        <motion.ol 
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.li key={i} variants={fadeInItem} className={`rounded-2xl border ${theme.border} p-4 sm:p-6`}>
              <span className={`text-xs font-semibold tracking-[0.18em] ${theme.stepLabel}`}>
                {p('label.step')} {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{p(`flow.${i}.title`)}</h3>
              <p className={`mt-3 text-sm leading-6 ${theme.textBody}`}>{p(`flow.${i}.desc`)}</p>
            </motion.li>
          ))}
        </motion.ol>
      </Section>

      <Section
        eyebrow={p('decision.eyebrow')}
        title={p('decision.title')}
        description={p('decision.desc')}
        theme={theme}
      >
        {/* Desktop: Table */}
        <div className={`hidden md:block overflow-hidden rounded-2xl border ${theme.border}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className={theme.tableHead}>
                <tr>
                  <th className="px-5 py-4 font-medium">{p('decision.th.status')}</th>
                  <th className="px-5 py-4 font-medium">{p('decision.th.condition')}</th>
                  <th className="px-5 py-4 font-medium">{p('decision.th.action')}</th>
                  <th className="px-5 py-4 font-medium">{p('decision.th.telegram')}</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const statusText = p(`decision.${i}.status`);
                  const badgeCls = badgeMap[statusText] || toneClasses[decisionTones[i]];
                  return (
                  <tr key={i} className={`border-t ${theme.border} align-top`}>
                    <td className="px-5 py-5">
                      <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${badgeCls}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className={`px-5 py-5 leading-6 ${theme.textBody}`}>{badgify(p(`decision.${i}.condition`))}</td>
                    <td className={`px-5 py-5 leading-6 ${theme.textStrong}`}>{badgify(p(`decision.${i}.action`))}</td>
                    <td className={`px-5 py-5 leading-6 ${theme.textBody}`}>{p(`decision.${i}.telegram`)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: Card layout */}
        <motion.div 
          className="grid gap-4 md:hidden"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3, 4, 5].map(i => {
            const statusText = p(`decision.${i}.status`);
            const badgeCls = badgeMap[statusText] || toneClasses[decisionTones[i]];
            return (
              <motion.div key={i} variants={fadeInItem} className={`rounded-2xl border ${theme.border} p-4 space-y-4`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`shrink-0 inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${badgeCls}`}>
                    {statusText}
                  </span>
                  <span className={`text-xs text-right leading-relaxed ${theme.textMuted}`}>{p(`decision.${i}.telegram`)}</span>
                </div>
                <p className={`text-sm leading-6 ${theme.textBody}`}>
                  <span className={`font-medium ${theme.textStrong}`}>{p('decision.th.condition')}:</span> {p(`decision.${i}.condition`)}
                </p>
                <p className={`text-sm leading-6 ${theme.textBody}`}>
                  {badgify(p(`decision.${i}.action`))}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      <Section
        eyebrow={p('feedback.eyebrow')}
        title={p('feedback.title')}
        description={p('feedback.desc')}
        theme={theme}
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`rounded-2xl border ${theme.border} p-4 sm:p-8`}>
            <h3 className="text-xl font-semibold">{p('feedback.hierarchy')}</h3>
            <ol className="mt-6 space-y-5">
              {[0, 1, 2, 3].map(i => (
                <li key={i} className="flex gap-4">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${theme.numberCircle} text-xs font-semibold`}>
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-medium">{p(`feedback.h.${i}.title`)}</h4>
                    <p className={`mt-1 text-sm leading-6 ${theme.textBody}`}>{p(`feedback.h.${i}.desc`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4 text-zinc-100 sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-sm font-semibold">{p('feedback.telegram.title')}</p>
                <p className="mt-1 text-xs text-zinc-400">{p('feedback.telegram.subtitle')}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${badgeMap['Testing']}`}>
                {p('decision.2.status')}
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-6 text-zinc-300">
              <p className="text-base font-semibold text-white">
                {p('feedback.telegram.headline')}
              </p>
              <p>
                <strong className="text-zinc-100">{p('label.task')}</strong> {p('feedback.telegram.task')}
              </p>
              <p>
                <strong className="text-zinc-100">{p('label.evidence')}</strong> {p('feedback.telegram.evidence')}
              </p>
              <p>
                <strong className="text-zinc-100">{p('label.synced')}</strong> {p('feedback.telegram.synced')}
              </p>
              <p>
                <strong className="text-zinc-100">{p('label.next')}</strong> {p('feedback.telegram.next')}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow={p('reliability.eyebrow')}
        title={p('reliability.title')}
        theme={theme}
      >
        <motion.div 
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.article key={i} variants={fadeInItem} className={`rounded-2xl border ${theme.border} p-4 sm:p-6 ${cardHoverStyle}`}>
              <h3 className="text-lg font-semibold">{p(`safeguard.${i}.title`)}</h3>
              <p className={`mt-3 text-sm leading-6 ${theme.textBody}`}>{p(`safeguard.${i}.desc`)}</p>
            </motion.article>
          ))}
        </motion.div>
      </Section>

      <Section
        eyebrow={p('ops.eyebrow')}
        title={p('ops.title')}
        theme={theme}
      >
        <motion.div 
          className="grid gap-5 lg:grid-cols-4"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3].map(i => (
            <motion.article key={i} variants={fadeInItem} className={`rounded-2xl ${theme.cardAlt} p-4 sm:p-6 ${cardHoverStyle}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${theme.eyebrow}`}>{p(`ops.${i}.label`)}</p>
              <h3 className="mt-5 text-lg font-semibold">{p(`ops.${i}.title`)}</h3>
              <p className={`mt-3 text-sm leading-6 ${theme.textBody}`}>{p(`ops.${i}.desc`)}</p>
            </motion.article>
          ))}
        </motion.div>
      </Section>

      <Section
        eyebrow={p('impact.eyebrow')}
        title={p('impact.title')}
        description={p('impact.desc')}
        theme={theme}
      >
        <motion.ul 
          className="grid gap-4 md:grid-cols-2"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
        >
          {[0, 1, 2, 3].map(i => (
            <motion.li key={i} variants={fadeInItem} className={`flex gap-3 rounded-2xl border ${theme.border} p-4 sm:p-5 text-sm leading-6 ${theme.textStrong}`}>
              <span aria-hidden="true" className={`mt-0.5 ${theme.checkmark}`}>✓</span>
              <span>{p(`impact.${i}`)}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Section>

      <motion.section 
        className="mb-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 relative text-zinc-100">
          <div className="relative">
            <ZoomableImage src="/images/case-study/ai_process_cs_1.jpg" alt="AI Process Abstract" className="w-full h-56 md:h-80 object-cover object-center opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
          </div>
          <div className="px-6 pb-10 md:pb-16 relative z-10 -mt-16 md:-mt-24 pt-16 md:pt-24 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
              {p('footer.eyebrow')}
            </p>
            <h2 className="max-w-4xl mx-auto text-3xl md:text-4xl font-black tracking-tight mb-8 md:mb-10 text-white">
              {p('footer.title')}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => handleQuestSelect('dispatch')} className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors text-zinc-100 cursor-pointer">
                {p('footer.link.0')}
              </button>
              <button onClick={() => handleQuestSelect('agent-rules')} className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors text-zinc-100 cursor-pointer">
                {p('footer.link.1')}
              </button>
              <a href="#solution" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">
                {p('footer.link.2')}
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
    </CaseStudyLayout>
  );
}
