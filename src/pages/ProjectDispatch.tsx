import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';

export const ProjectDispatch: React.FC = () => {
  const { isLightMode, handleQuestSelect } = useStore();
  const t = useT();
  
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800',
    accent: isLightMode ? 'text-emerald-600' : 'text-emerald-400',
    accentBg: isLightMode ? 'bg-emerald-50' : 'bg-emerald-900/20',
    border: isLightMode ? 'border-slate-200' : 'border-slate-800',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-emerald-100/50 via-transparent to-transparent' : 'from-emerald-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* SECTION 1: Hero */}
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <p className={`text-sm font-bold tracking-widest uppercase mb-4 ${theme.accent}`}>{t('dispatch.hero.label')}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                {t('dispatch.hero.title1')}<span className={theme.accent}>{t('dispatch.hero.title2')}</span>{t('dispatch.hero.title3')}
              </h1>
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${theme.textMuted}`}>
                {t('dispatch.hero.desc1')}<code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code>{t('dispatch.hero.desc2')}<code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>.agent-rules</code>{t('dispatch.hero.desc3')}
              </p>
              <blockquote className={`pl-6 border-l-4 ${isLightMode ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-500 bg-emerald-900/10'} py-4 pr-4 rounded-r-xl italic text-lg ${theme.text}`}>
                {t('dispatch.hero.quote')}
              </blockquote>
            </div>
            <div className="flex-1 w-full relative">
              <div className={`absolute inset-0 bg-emerald-500 rounded-3xl blur-3xl opacity-20`}></div>
              <ZoomableImage src="/images/case-study/hero_routing_portrait.jpg" alt="AI Agent Orchestrator Routing" className="relative z-10 w-full rounded-3xl shadow-2xl object-cover border border-slate-200/20" />
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: Original Workflow */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.workflow.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.workflow.title')}</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              {t('dispatch.workflow.desc1')}<code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code>{t('dispatch.workflow.desc2')}
            </p>
          </div>

          <div className="mb-16 text-center">
            <ZoomableImage src="/images/case-study/workflow_original.jpg" alt="Original Workflow Diagram" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-12">
            {[
              { title: "{t('dispatch.workflow.step1.title')}", desc: "{t('dispatch.workflow.step1.desc')}", color: "bg-amber-500" },
              { title: "{t('dispatch.workflow.step2.title')}", desc: "{t('dispatch.workflow.step2.desc')}", color: "bg-slate-500" },
              { title: "{t('dispatch.workflow.step3.title')}", desc: "{t('dispatch.workflow.step3.desc')}", color: "bg-emerald-500" },
              { title: "{t('dispatch.workflow.step4.title')}", desc: "{t('dispatch.workflow.step4.desc')}", color: "bg-amber-500" },
              { title: "{t('dispatch.workflow.step5.title')}", desc: "{t('dispatch.workflow.step5.desc')}", color: "bg-slate-500" },
              { title: "{t('dispatch.workflow.step6.title')}", desc: "{t('dispatch.workflow.step6.desc')}", color: "bg-emerald-500" },
              { title: "{t('dispatch.workflow.step7.title')}", desc: "{t('dispatch.workflow.step7.desc')}", color: "bg-amber-500" },
              { title: "{t('dispatch.workflow.step8.title')}", desc: "{t('dispatch.workflow.step8.desc')}", color: "bg-slate-500" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full ${step.color} ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className={theme.textMuted}>{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 3: Breakdown */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.breakdown.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.breakdown.title')}</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              {t('dispatch.breakdown.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "{t('dispatch.breakdown.card1.title')}", desc: "{t('dispatch.breakdown.card1.desc')}" },
              { title: "{t('dispatch.breakdown.card2.title')}", desc: "{t('dispatch.breakdown.card2.desc')}" },
              { title: "{t('dispatch.breakdown.card3.title')}", desc: "{t('dispatch.breakdown.card3.desc')}" },
              { title: "{t('dispatch.breakdown.card4.title')}", desc: "{t('dispatch.breakdown.card4.desc')}" },
              { title: "{t('dispatch.breakdown.card5.title')}", desc: "{t('dispatch.breakdown.card5.desc')}" },
              { title: "{t('dispatch.breakdown.card6.title')}", desc: "{t('dispatch.breakdown.card6.desc')}" }
            ].map((card, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border-l-4 border-l-amber-500 ${theme.card}`}>
                <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-3">{card.title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 4: Research */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.research.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold">{t('dispatch.research.title')}</h2>
          </div>

          <div className="mb-12 text-center">
            <ZoomableImage src="/images/case-study/research_synthesis.jpg" alt="Research and Synthesis" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="space-y-6">
            {[
              { num: "01", title: "{t('dispatch.research.step1.title')}", desc: "{t('dispatch.research.step1.desc')}" },
              { num: "02", title: "{t('dispatch.research.step2.title')}", desc: "{t('dispatch.research.step2.desc')}" },
              { num: "03", title: "{t('dispatch.research.step3.title')}", desc: "{t('dispatch.research.step3.desc')}" },
              { num: "04", title: "{t('dispatch.research.step4.title')}", desc: "Đánh dấu những \"ranh giới đỏ\" bắt buộc con người phải nhảy vào duyệt (vd: sửa Database, Auth)." },
              { num: "05", title: "{t('dispatch.research.step5.title')}", desc: "{t('dispatch.research.step5.desc')}" }
            ].map((step, idx) => (
              <div key={idx} className={`flex items-start gap-4 p-5 rounded-xl ${theme.card}`}>
                <span className={`text-2xl font-black ${theme.accent} opacity-50`}>{step.num}</span>
                <div>
                  <strong className={theme.text}>{step.title}</strong> <span className={theme.textMuted}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 5: Solution (Before/After) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.solution.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.solution.title')}</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              {t('dispatch.solution.desc1')}<strong>{t('dispatch.solution.desc2')}</strong>{t('dispatch.solution.desc3')}<strong>{t('dispatch.solution.desc4')}</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Header row for MD+ screens */}
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-slate-800`}>{t('dispatch.solution.table.header1')}</div>
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-slate-800`}>{t('dispatch.solution.table.header2')}</div>
            <div className={`hidden md:block col-span-1 p-5 font-bold text-slate-100 bg-emerald-800`}>{t('dispatch.solution.table.header3')}</div>

            {[
              { domain: t('dispatch.solution.table.row1.domain'), before: t('dispatch.solution.table.row1.before'), after: t('dispatch.solution.table.row1.after') },
              { domain: t('dispatch.solution.table.row2.domain'), before: t('dispatch.solution.table.row2.before'), after: t('dispatch.solution.table.row2.after') },
              { domain: t('dispatch.solution.table.row3.domain'), before: t('dispatch.solution.table.row3.before'), after: t('dispatch.solution.table.row3.after') },
              { domain: t('dispatch.solution.table.row4.domain'), before: t('dispatch.solution.table.row4.before'), after: "{t('dispatch.solution.table.row4.after')}" },
              { domain: t('dispatch.solution.table.row5.domain'), before: t('dispatch.solution.table.row5.before'), after: t('dispatch.solution.table.row5.after') },
              { domain: t('dispatch.solution.table.row6.domain'), before: t('dispatch.solution.table.row6.before'), after: t('dispatch.solution.table.row6.after') },
              { domain: t('dispatch.solution.table.row7.domain'), before: t('dispatch.solution.table.row7.before'), after: t('dispatch.solution.table.row7.after') },
              { domain: t('dispatch.solution.table.row8.domain'), before: t('dispatch.solution.table.row8.before'), after: t('dispatch.solution.table.row8.after') },
              { domain: t('dispatch.solution.table.row9.domain'), before: t('dispatch.solution.table.row9.before'), after: t('dispatch.solution.table.row9.after') },
              { domain: t('dispatch.solution.table.row10.domain'), before: t('dispatch.solution.table.row10.before'), after: t('dispatch.solution.table.row10.after') }
            ].map((row, idx) => (
              <React.Fragment key={idx}>
                {/* Mobile headers (only show on mobile) */}
                <div className={`md:hidden col-span-1 p-4 font-bold text-amber-600 dark:text-amber-500 bg-slate-100 dark:bg-slate-900 border-t ${idx > 0 ? 'border-slate-200 dark:border-slate-800' : 'border-transparent'}`}>{row.domain}</div>
                <div className={`md:hidden col-span-1 px-4 py-2 text-sm ${theme.textMuted}`}>{t('dispatch.solution.table.mobile.before')} {row.before}</div>
                <div className={`md:hidden col-span-1 px-4 py-2 pb-4 text-sm font-medium ${theme.text}`}>{t('dispatch.solution.table.mobile.after')} {row.after}</div>
                
                {/* Desktop rows */}
                <div className={`hidden md:flex items-center p-5 font-bold text-amber-600 dark:text-amber-500 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50`}>{row.domain}</div>
                <div className={`hidden md:flex items-center p-5 text-sm ${theme.textMuted} bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50`}>{row.before}</div>
                <div className={`hidden md:flex items-center p-5 text-sm font-medium ${theme.text} bg-emerald-50/30 dark:bg-emerald-900/10 border-t border-slate-100 dark:border-slate-800/50`}>{row.after}</div>
              </React.Fragment>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: Route A/B/C Deep Dive */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.route.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.route.title')}</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              {t('dispatch.route.desc1')}<code className={`px-2 py-1 rounded ${theme.accentBg} ${theme.accent} font-mono text-sm`}>/dispatch</code>{t('dispatch.route.desc2')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Route A */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl font-bold">A</span>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">{t('dispatch.route.a.title')}</h3>
              </div>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>{t('dispatch.route.a.desc')}</p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">{t('dispatch.route.agent')}</span> <span className={theme.text}>{t('dispatch.route.a.agent')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">{t('dispatch.route.env')}</span> <span className={theme.text}>{t('dispatch.route.a.env')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-emerald-600 dark:text-emerald-500">{t('dispatch.route.check')}</span> <span className={theme.text}>{t('dispatch.route.a.check')}</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-sm">
                <strong>{t('dispatch.route.example')}</strong> {t('dispatch.route.a.example')}
              </div>
            </div>

            {/* Route B */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-amber-500 ${theme.card}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-bold">B</span>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500">{t('dispatch.route.b.title')}</h3>
              </div>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>{t('dispatch.route.b.desc')}</p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">{t('dispatch.route.agent')}</span> <span className={theme.text}>{t('dispatch.route.b.agent')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">{t('dispatch.route.env')}</span> <span className={theme.text}>{t('dispatch.route.b.env')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-amber-600 dark:text-amber-500">{t('dispatch.route.check')}</span> <span className={theme.text}>{t('dispatch.route.b.check')}</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-amber-500/10 text-sm">
                <strong>{t('dispatch.route.example')}</strong> {t('dispatch.route.b.example')}
              </div>
            </div>

            {/* Route C */}
            <div className={`p-8 rounded-2xl border-t-4 border-t-red-500 bg-slate-900 border border-slate-800`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center text-xl font-bold">C</span>
                <h3 className="text-xl font-bold text-slate-100">{t('dispatch.route.c.title')}</h3>
              </div>
              <p className={`text-sm mb-6 text-slate-300`}>{t('dispatch.route.c.desc1')}<strong className="text-red-400">{t('dispatch.route.c.desc2')}</strong></p>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">{t('dispatch.route.agent')}</span> <span className="text-slate-200">{t('dispatch.route.c.agent')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">{t('dispatch.route.env')}</span> <span className="text-slate-200">{t('dispatch.route.c.env1')}<code className="text-emerald-400 px-1">Do NOT touch</code>{t('dispatch.route.c.env2')}</span></li>
                <li className="flex flex-col gap-1"><span className="font-bold text-red-400">{t('dispatch.route.check')}</span> <span className="text-slate-200">{t('dispatch.route.c.check')}</span></li>
              </ul>
              <div className="p-3 rounded-lg bg-red-500/15 text-sm text-slate-200">
                <strong>{t('dispatch.route.example')}</strong> {t('dispatch.route.c.example')}
              </div>
            </div>
          </div>

          <div className={`mt-10 p-6 rounded-xl ${theme.accentBg} ${theme.accent} font-medium text-center`}>
            {t('dispatch.route.note')}
          </div>
        </motion.section>

        {/* SECTION 7: My Role */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.role.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.role.title')}</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              {t('dispatch.role.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-2xl ${theme.card}`}>
              <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-2xl mb-6">{t('dispatch.role.focus1.title')}</h3>
              <ul className="space-y-4 list-disc list-inside">
                <li className={theme.textMuted}>{t('dispatch.role.focus1.item1')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus1.item2')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus1.item3')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus1.item4')}</li>
              </ul>
            </div>
            <div className={`p-8 rounded-2xl ${theme.card}`}>
              <h3 className="text-amber-600 dark:text-amber-500 font-bold text-2xl mb-6">{t('dispatch.role.focus2.title')}</h3>
              <ul className="space-y-4 list-disc list-inside">
                <li className={theme.textMuted}>{t('dispatch.role.focus2.item1')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus2.item2')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus2.item3')}</li>
                <li className={theme.textMuted}>{t('dispatch.role.focus2.item4')}</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* SECTION 8: Handoff Contract */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.handoff.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.handoff.title')}</h2>
            <p className={`text-lg max-w-4xl ${theme.textMuted}`}>
              {t('dispatch.handoff.desc')}
            </p>
          </div>

          <div className="mb-12 text-center">
            <ZoomableImage src="/images/case-study/handoff_contract.jpg" alt="Design Handoff Contracts" className="rounded-2xl shadow-lg max-h-[450px] inline-block w-full object-cover border border-slate-200/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border-t-4 border-t-amber-500 ${theme.card}`}>
              <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-3">{t('dispatch.handoff.card1.title')}</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{t('dispatch.handoff.card1.desc')}</p>
            </div>
            <div className={`p-6 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-lg mb-3">{t('dispatch.handoff.card2.title')}</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{t('dispatch.handoff.card2.desc')}</p>
            </div>
            <div className={`p-6 rounded-2xl border-t-4 border-t-slate-500 ${theme.card}`}>
              <h3 className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-3">{t('dispatch.handoff.card3.title')}</h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{t('dispatch.handoff.card3.desc')}</p>
            </div>
          </div>
        </motion.section>

        {/* SECTION 9: Real Example */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{t('dispatch.example.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('dispatch.example.title')}</h2>
            <p className={`text-lg max-w-3xl ${theme.textMuted}`}>
              {t('dispatch.example.desc')}
            </p>
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
            {[
              { title: "{t('dispatch.workflow.step1.title')}", desc: t('dispatch.example.step1.desc'), color: "bg-slate-300 dark:bg-slate-700" },
              { title: "{t('dispatch.workflow.step2.title')}", desc: t('dispatch.example.step2.desc'), color: "bg-slate-300 dark:bg-slate-700" },
              { title: "{t('dispatch.workflow.step3.title')}", desc: t('dispatch.example.step3.desc'), color: "bg-slate-300 dark:bg-slate-700" },
              { title: t('dispatch.example.step4.title'), desc: t('dispatch.example.step4.desc'), color: "bg-emerald-500" },
              { title: t('dispatch.example.step5.title'), desc: t('dispatch.example.step5.desc'), color: "bg-emerald-500" },
              { title: t('dispatch.example.step6.title'), desc: t('dispatch.example.step6.desc'), color: "bg-emerald-500" },
              { title: t('dispatch.example.step7.title'), desc: t('dispatch.example.step7.desc'), color: "bg-slate-800 dark:bg-slate-400" },
              { title: t('dispatch.example.step8.title'), desc: t('dispatch.example.step8.desc'), color: "bg-slate-800 dark:bg-slate-400" },
              { title: t('dispatch.example.step9.title'), desc: t('dispatch.example.step9.desc'), color: "bg-emerald-500" },
              { title: t('dispatch.example.step10.title'), desc: t('dispatch.example.step10.desc'), color: "bg-slate-300 dark:bg-slate-700" },
              { title: t('dispatch.example.step11.title'), desc: t('dispatch.example.step11.desc'), color: "bg-slate-300 dark:bg-slate-700", last: true }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full ${step.color} ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                <p className={theme.textMuted}>{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20">
          <div className={`rounded-3xl overflow-hidden border ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'} relative`}>
            <ZoomableImage src="/images/case-study/dispatch_farewell.jpg" alt="Dispatch Command Center" className="w-full h-64 md:h-80 object-cover object-center" />
            <div className="p-10 md:p-16 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-6">{t('dispatch.farewell.title')}</h2>
              <p className={`text-lg max-w-2xl mx-auto mb-10 ${theme.textMuted}`}>
                {t('dispatch.farewell.desc1')}<strong>{t('dispatch.farewell.desc2')}</strong>{t('dispatch.farewell.desc3')}<strong>{t('dispatch.farewell.desc4')}</strong>{t('dispatch.farewell.desc5')}
              </p>
              <button onClick={() => handleQuestSelect('agent-rules')} className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold transition-colors cursor-pointer">
                {t('dispatch.farewell.btn')}
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </motion.section>
        
      </div>
    </CaseStudyLayout>
  );
};
