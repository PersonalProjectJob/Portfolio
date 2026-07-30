import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';

const IconCheck = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconArrowRight = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export const ProjectAgentRules: React.FC = () => {
  const { isLightMode, handleQuestSelect } = useStore();
  const t = useT();
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/10',
    cardHighlight: isLightMode ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-900/10 border-indigo-500/30',
    accent: isLightMode ? 'text-indigo-600' : 'text-indigo-400',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(79,70,229,0.15)]' : 'shadow-[0_0_30px_rgba(79,70,229,0.1)]'
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const [activeTab, setActiveTab] = useState(1);

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-indigo-100/50 via-transparent to-transparent' : 'from-indigo-900/20 via-transparent to-transparent'}`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* {t('agentRules.s1.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s1.tag')}</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">{t('agentRules.s1.title')}</h1>
              <p className={`text-lg md:text-xl ${theme.textMuted} mb-8 leading-relaxed`}>{t('agentRules.s1.desc')}</p>
              <blockquote className={`p-6 border-l-4 border-indigo-500 ${theme.cardHighlight} rounded-r-xl italic ${theme.text} text-lg`}>{t('agentRules.s1.quote')}</blockquote>
            </div>
            <div className="flex items-center justify-center">
              <ZoomableImage src="/images/case-study/agent_rules_hero.jpg" alt="Tacit Knowledge to Systematic Rules" className="w-full rounded-2xl shadow-xl object-contain" />
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s2.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s2.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s2.title')}</h2>
          <ZoomableImage src="/images/case-study/workflow_original.jpg" alt="Workflow Original" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-6" />
          <p className={`mb-10 ${theme.textMuted}`}>{t('agentRules.s2.desc1')}<code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">.agent-rules</code>{t('agentRules.s2.desc2')}</p>

          <div className={`${theme.card} rounded-2xl overflow-hidden`}>
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              {['User Story', 'GitHub Issue', 'Design', 'Implementation', 'Evidence', 'QA', 'Tracking'].map((tab, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTab(idx + 1)}
                  className={`px-4 py-3 whitespace-nowrap text-sm font-medium transition-colors ${activeTab === idx + 1 ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {`0${idx + 1}. ${tab}`}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t1.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t1.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t2.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t2.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t3.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t3.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 4 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t4.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t4.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 5 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t5.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t5.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 6 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t6.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t6.bot')}</p>
                  </div>
                </div>
              )}
              {activeTab === 7 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.artifact')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t7.art')}</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h4 className="font-bold mb-2">{t('agentRules.s2.bottleneck')}</h4>
                    <p className={theme.textMuted}>{t('agentRules.s2.t7.bot')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s3.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s3.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s3.title')}</h2>
          <ZoomableImage src="/images/case-study/before_after_chaos.jpg" alt="Tacit Knowledge Chaos" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8" />
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">{t('agentRules.s3.c1.title')}</h3>
              <p className={`text-sm ${theme.textMuted}`}>{t('agentRules.s3.c1.desc')}</p>
            </div>
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">{t('agentRules.s3.c2.title')}</h3>
              <p className={`text-sm ${theme.textMuted}`}>{t('agentRules.s3.c2.desc')}</p>
            </div>
            <div className={`p-6 rounded-xl border-t-4 border-red-500 ${theme.card}`}>
              <h3 className="text-red-500 font-bold mb-3">{t('agentRules.s3.c3.title')}</h3>
              <p className={`text-sm ${theme.textMuted}`}>{t('agentRules.s3.c3.desc')}</p>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${theme.cardHighlight} flex gap-4 items-center`}>
            <span className="text-2xl">💡</span>
            <p className={theme.text}>{t('agentRules.s3.q1')}<strong>{t('agentRules.s3.q2')}</strong>{t('agentRules.s3.q3')}</p>
          </div>
        </motion.section>

        {/* {t('agentRules.s4.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s4.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s4.title')}</h2>
          <p className={`mb-8 ${theme.textMuted}`}>{t('agentRules.s4.desc1')}<code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">.agent-rules</code>{t('agentRules.s4.desc2')}</p>
          
          <div className={`px-4 py-6 md:p-8 rounded-2xl ${theme.card} relative`}>
            <div className="flex justify-center mb-8">
              <div className="px-6 py-4 rounded-xl bg-indigo-600 text-white shadow-lg text-center relative z-10">
                <span className="text-2xl mb-2 block">🧭</span>
                <strong className="block text-lg">.agent-rules</strong>
                <span className="text-sm text-indigo-100">{t('agentRules.s4.router')}</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { file: 'task-sizing.md', desc: t('agentRules.s4.f1.desc') },
                { file: 'obsidian-us-workflow.md', desc: t('agentRules.s4.f2.desc') },
                { file: 'github-issue.md', desc: t('agentRules.s4.f3.desc') },
                { file: 'screen-registry.md', desc: t('agentRules.s4.f4.desc') },
                { file: 'reports-export.md', desc: t('agentRules.s4.f5.desc') },
                { file: 'carry-over.md', desc: t('agentRules.s4.f6.desc') }
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${isLightMode ? 'bg-white' : 'bg-slate-800/50'}`}>
                  <h4 className="font-mono font-bold mb-2">📄 {item.file}</h4>
                  <p className={`text-sm ${theme.textMuted}`}>{item.desc}</p>
                </div>
              ))}
              <div className={`col-span-1 md:col-span-2 lg:col-span-3 p-4 rounded-lg border-l-4 border-emerald-500 ${isLightMode ? 'bg-white' : 'bg-slate-800/50'} flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6`}>
                <h4 className="font-mono font-bold whitespace-nowrap">📁 scripts/</h4>
                <p className={`text-sm ${theme.textMuted}`}>{t('agentRules.s4.tool')}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s5.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s5.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s5.title')}</h2>
          <ZoomableImage src="/images/case-study/gatekeeper_shield.jpg" alt="Gatekeeper Shield" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-6" />
          <p className={`mb-8 ${theme.textMuted}`}>{t('agentRules.s5.desc')}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className={`p-5 md:p-8 rounded-xl border-l-4 border-emerald-500 ${theme.card}`}>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">{t('agentRules.s5.micro.title')}</h3>
              <ul className={`space-y-2 ${theme.text} list-disc list-inside`}>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s5.micro.1') }} />
                <li>{t('agentRules.s5.micro.2')}</li>
                <li>{t('agentRules.s5.micro.3')}</li>
                <li>{t('agentRules.s5.micro.4')}</li>
                <li>{t('agentRules.s5.micro.5')}</li>
              </ul>
            </div>
            <div className={`p-5 md:p-8 rounded-xl border-l-4 border-amber-500 ${theme.card}`}>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500 mb-4">{t('agentRules.s5.macro.title')}</h3>
              <ul className={`space-y-2 ${theme.text} list-disc list-inside`}>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s5.macro.1') }} />
                <li>{t('agentRules.s5.macro.2')}</li>
                <li>{t('agentRules.s5.macro.3')}</li>
                <li>{t('agentRules.s5.macro.4')}</li>
                <li>{t('agentRules.s5.macro.5')}</li>
                <li>{t('agentRules.s5.macro.6')}</li>
              </ul>
            </div>
          </div>
          
          <div className="p-5 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">{t('agentRules.s5.esc.title')}</h4>
            <p className="text-sm" dangerouslySetInnerHTML={{ __html: t('agentRules.s5.esc.desc') }} />
          </div>
        </motion.section>

        {/* {t('agentRules.s6.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s6.tag')}</p>
          <h2 className="text-3xl font-bold mb-8">{t('agentRules.s6.title')}</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 md:p-6 rounded-xl border ${theme.card}`}>
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">Lane A — {t('agentRules.s5.micro.title')}</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l1.i1')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>{t('agentRules.s6.l1.d1')}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l1.i2')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s6.l1.d2') }} /></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l1.i3')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>{t('agentRules.s6.l1.d3')}</p></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 md:p-6 rounded-xl border ${theme.card}`}>
                <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-4">Lane B — {t('agentRules.s5.macro.title')}</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l2.i1')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>{t('agentRules.s6.l2.d1')}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l2.i2')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>{t('agentRules.s6.l2.d2')}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div><h4 className="font-bold text-sm">{t('agentRules.s6.l2.i3')}</h4><p className={`text-xs mt-1 ${theme.textMuted}`}>{t('agentRules.s6.l2.d3')}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s7.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s7.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s7.title')}</h2>
          <p className={`mb-8 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s7.desc') }} />

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-4">{t('agentRules.s7.i1.title')}</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s7.i1.1') }} />
                <li>{t('agentRules.s7.i1.2')}</li>
              </ul>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-4">{t('agentRules.s7.i2.title')}</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s7.i2.1') }} />
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s7.i2.2') }} />
                <li>{t('agentRules.s7.i2.3')}</li>
                <li>Assignee: <code>qa-owner</code> + <code>dev-owner</code>.</li>
              </ul>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">{t('agentRules.s7.i3.title')}</h3>
              <ul className={`space-y-2 text-sm ${theme.text} list-disc list-inside`}>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s7.i3.1') }} />
                <li>{t('agentRules.s7.i3.2')}</li>
                <li>{t('agentRules.s7.i3.3')}</li>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s7.i3.4') }} />
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Dev Task = Done</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">{t('agentRules.s2.t6.art')} = Testing</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full">QA Pass</span>
            <IconArrowRight className="w-5 h-5 text-slate-400" />
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full">{t('agentRules.s2.t6.art')} = Done</span>
          </div>
          <p className={`mt-3 text-xs ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s7.fail') }} />
        </motion.section>

        {/* {t('agentRules.s8.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s8.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s8.title')}</h2>
          <ZoomableImage src="/images/case-study/issue_ui_registry.jpg" alt="Issue & UI Registry Interface" className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">{t('agentRules.s8.i1.title')}</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s8.i1.desc') }} />
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs leading-relaxed">
                - <strong>{t('agentRules.s8.m1')}</strong>{t('agentRules.s8.v1')}<br/>
                - <strong>{t('agentRules.s8.m2')}</strong>{t('agentRules.s8.v2')}<br/>
                - <strong>{t('agentRules.s8.m3')}</strong> Mobile / Desktop<br/>
                - <strong>{t('agentRules.s8.m4')}</strong>{t('agentRules.s8.v4')}<br/>
                - <strong>{t('agentRules.s8.m5')}</strong>{t('agentRules.s8.v5')}<br/>
                - <strong>{t('agentRules.s8.m6')}</strong>{t('agentRules.s8.v6')}</div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">{t('agentRules.s8.i2.title')}</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s8.i2.desc') }} />
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">{t('agentRules.s8.t1')}</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">{t('agentRules.s8.t2')}</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">{t('agentRules.s8.t3')}</th>
                    </tr>
                  </thead>
                  <tbody className={theme.text}>
                    <tr>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">{t('agentRules.s8.v7')}</td>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">/staff/:id</code></td>
                      <td className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">staff-detail</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s9.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s9.tag')}</p>
          <h2 className="text-3xl font-bold mb-6">{t('agentRules.s9.title')}</h2>
          <p className={`mb-8 ${theme.textMuted}`}>{t('agentRules.s9.desc')}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3">{t('agentRules.s9.i1.title')}</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`}>{t('agentRules.s9.i1.desc')}</p>
              <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                &lt;id&gt;--&lt;screen-slug&gt;--&lt;state&gt;--&lt;desc&gt;.png
              </div>
            </div>
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className="font-bold text-red-500 mb-3">{t('agentRules.s9.i2.title')}</h3>
              <p className={`text-sm mb-4 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s9.i2.desc') }} />
              <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded font-mono text-xs text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre">{t('agentRules.s9.log1')}<br/>{t('agentRules.s9.log2')}</div>
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s10.tag')}: US-093 */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s10.tag')}</p>
          <h2 className="text-3xl font-bold mb-8">{t('agentRules.s10.title')}</h2>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border-l-4 border-indigo-500 ${theme.card}`}>
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">1. {t('agentRules.s7.i1.title')}</h4>
              <p className={theme.text}>{t('agentRules.s10.v1')}</p>
            </div>
            <div className={`p-6 rounded-xl border-l-4 border-amber-500 ${theme.card}`}>
              <h4 className="font-bold text-amber-600 dark:text-amber-500 mb-2">{t('agentRules.s10.i2')}</h4>
              <p className={theme.text}>{t('agentRules.s10.v2a')}<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">{t('agentRules.s10.v2b')}</code>{t('agentRules.s10.v2c')}</p>
            </div>
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl">
              <h4 className="font-bold text-sky-400 mb-3">{t('agentRules.s10.i3')}</h4>
              <div className="font-mono text-sm leading-relaxed">
                - <strong>{t('agentRules.s8.m1')}</strong>{t('agentRules.s10.v2b')}<br/>
                - <strong>{t('agentRules.s8.m2')}</strong>{t('agentRules.s10.v3a')}<br/>
                - <strong>{t('agentRules.s8.m3')}</strong>{t('agentRules.s10.v3b')}<br/>
                - <strong>{t('agentRules.s8.m4')}</strong>{t('agentRules.s10.v3c')}<br/>
                - <strong>{t('agentRules.s8.m6')}</strong>{t('agentRules.s10.v3d')}</div>
            </div>
            <div className={`p-6 rounded-xl border-l-4 border-emerald-500 ${theme.card}`}>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4">{t('agentRules.s10.i4')}</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-bold mb-2 ${theme.textMuted}`}>{t('agentRules.s10.v4a')}</p>
                  <ZoomableImage src="/images/case-study/us_093_current.jpg" alt="Current State" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                </div>
                <div>
                  <p className={`text-sm font-bold mb-2 ${theme.textMuted}`}>{t('agentRules.s10.v4b')}</p>
                  <ZoomableImage src="/images/case-study/us_093_expected.jpg" alt="Expected State" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* {t('agentRules.s11.tag')} KHI CÓ RULE */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s11.tag')}</p>
          <h2 className="text-3xl font-bold mb-8">{t('agentRules.s11.title')}</h2>
          
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-4 text-sm font-bold">
              <div className="flex-1 text-slate-500 dark:text-slate-400">⚠️ {t('agentRules.s11.old')}</div>
              <div className="w-12"></div>
              <div className="flex-1 text-indigo-600 dark:text-indigo-400">💡 {t('agentRules.s11.new')}</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                [t('agentRules.s11.r1a'), t('agentRules.s11.r1b')],
                [t('agentRules.s11.r2a'), t('agentRules.s11.r2b')],
                [t('agentRules.s11.r3a'), t('agentRules.s11.r3b')],
                [t('agentRules.s11.r4a'), t('agentRules.s11.r4b')],
                [t('agentRules.s11.r5a'), t('agentRules.s11.r5b')],
                [t('agentRules.s11.r6a'), t('agentRules.s11.r6b')],
                [t('agentRules.s11.r7a'), t('agentRules.s11.r7b')]
              ].map((row, i) => (
                <div key={i} className={`flex items-center p-4 ${theme.bg}`}>
                  <div className={`flex-1 flex items-start gap-2 ${theme.textMuted} text-sm`}><IconX className="w-5 h-5 text-red-400 shrink-0 mt-0.5" /> <span>{row[0]}</span></div>
                  <div className="w-12 flex justify-center text-slate-300 dark:text-slate-700">➔</div>
                  <div className={`flex-1 flex items-start gap-2 ${theme.text} text-sm font-medium`}><IconCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> <span>{row[1]}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 12. KIỂM SOÁT & ĐÁNH ĐỔI */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s12.tag')}</p>
          <h2 className="text-3xl font-bold mb-8">{t('agentRules.s12.title')}</h2>
          
          <h3 className="text-xl font-bold mb-6">{t('agentRules.s12.st1')}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {[
              { title: t('agentRules.s12.t1.title'), agent: t('agentRules.s12.t1.agent'), human: t('agentRules.s12.t1.human') },
              { title: t('agentRules.s12.t2.title'), agent: t('agentRules.s12.t2.agent'), human: t('agentRules.s12.t2.human') },
              { title: t('agentRules.s12.t3.title'), agent: t('agentRules.s12.t3.agent'), human: t('agentRules.s12.t3.human') },
              { title: t('agentRules.s12.t4.title'), agent: t('agentRules.s12.t4.agent'), human: t('agentRules.s12.t4.human') },
              { title: t('agentRules.s12.t5.title'), agent: t('agentRules.s12.t5.agent'), human: t('agentRules.s12.t5.human') },
              { title: t('agentRules.s12.t6.title'), agent: t('agentRules.s12.t6.agent'), human: t('agentRules.s12.t6.human') }
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
                <h4 className="font-bold mb-3">{item.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2 items-start"><span className="shrink-0 w-6">🤖</span> <span className={theme.textMuted}>{item.agent}</span></div>
                  <div className="flex gap-2 items-start"><span className="shrink-0 w-6">👤</span> <span className={theme.text}>{item.human}</span></div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mb-6">{t('agentRules.s12.st2')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">{t('agentRules.s12.o1.title')}</h4>
              <p className={`text-xs ${theme.textMuted}`}>{t('agentRules.s12.o1.desc')}</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">{t('agentRules.s12.o2.title')}</h4>
              <p className={`text-xs ${theme.textMuted}`}>{t('agentRules.s12.o2.desc')}</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">{t('agentRules.s12.o3.title')}</h4>
              <p className={`text-xs ${theme.textMuted}`}>{t('agentRules.s12.o3.desc')}</p>
            </div>
            <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 ${theme.bg}`}>
              <h4 className="font-bold mb-2 text-sm">{t('agentRules.s12.o4.title')}</h4>
              <p className={`text-xs ${theme.textMuted}`}>{t('agentRules.s12.o4.desc')}</p>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${theme.cardHighlight} flex gap-4 items-center`}>
            <span className="text-2xl">💡</span>
            <p className={theme.text}>{t('agentRules.s12.q1')}<strong>{t('agentRules.s12.q2')}</strong>{t('agentRules.s12.q3')}</p>
          </div>
        </motion.section>

        {/* {t('agentRules.s13.tag')} */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-16 md:mb-24">
          <p className="text-sm font-bold tracking-widest uppercase mb-4 text-indigo-500">{t('agentRules.s13.tag')}</p>
          <h2 className="text-3xl font-bold mb-8">{t('agentRules.s13.title')}</h2>
          
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-4">{t('agentRules.s13.st1')}</h3>
              <p className={`text-sm mb-6 ${theme.textMuted}`}>{t('agentRules.s13.desc1')}</p>
              
              <div className="space-y-3 font-mono text-xs md:text-sm">
                {[
                  ["Product Intent", "User Story / Refined requirement"],
                  ["Member Problem", "GitHub Issue"],
                  ["UI Naming", "Screen Registry"],
                  ["Execution State", "Dispatch Log"],
                  ["Canonical Evidence", "Obsidian Vault"],
                  [t('agentRules.s2.t4.art') + " Change", "Branch / Pull Request"],
                  ["QA Result", t('agentRules.s2.t6.art') + " Status"],
                  ["Sprint History", "Sprint file + Change History"]
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold whitespace-nowrap">{row[0]}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-indigo-600 dark:text-indigo-400 whitespace-nowrap overflow-hidden text-ellipsis">{row[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`p-8 rounded-2xl bg-slate-900 text-slate-100 shadow-xl`}>
              <h3 className="text-2xl font-serif text-amber-500 mb-4">{t('agentRules.s13.st2')}</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                {t('agentRules.s13.desc2')}
              </p>
              <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside marker:text-amber-500">
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s13.l1') }} />
                <li>{t('agentRules.s13.l2')}</li>
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s13.l3') }} />
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s13.l4') }} />
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s13.l5') }} />
                <li dangerouslySetInnerHTML={{ __html: t('agentRules.s13.l6') }} />
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 14. GRAND FINALE */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-20 text-center">
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 relative">
            <ZoomableImage src="/images/case-study/farewell_team.jpg" alt="Farewell Team" className="w-full h-64 md:h-80 object-cover object-center" />
            <div className="px-6 py-8 md:p-16 relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-6">{t('agentRules.s14.title')}</h2>
              <p className={`text-lg max-w-2xl mx-auto mb-8 md:mb-10 ${theme.textMuted}`} dangerouslySetInnerHTML={{ __html: t('agentRules.s14.desc') }} />
              <button onClick={() => handleQuestSelect('dispatch')} className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30 cursor-pointer">
                <IconArrowRight className="w-5 h-5 rotate-180" />{t('agentRules.s14.btn')}</button>
            </div>
          </div>
        </motion.section>

      </div>
    </CaseStudyLayout>
  );
};
