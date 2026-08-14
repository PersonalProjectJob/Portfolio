import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Sparkles, Clock, User, TrendingUp } from 'lucide-react';
import type { OverviewBlockData } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

export interface OverviewBlockRendererProps {
  data: OverviewBlockData;
  className?: string;
}

export const OverviewBlockRenderer: React.FC<OverviewBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle =
    resolveLocalizedString(data.sectionTitle, language) ||
    (language === 'vi' ? 'Tổng quan Dự án & Thách thức' : 'Project Overview & Challenge');
  const problem = resolveLocalizedString(data.problem, language);
  const solution = resolveLocalizedString(data.solution, language);
  const role = resolveLocalizedString(data.role, language);
  const timeline = resolveLocalizedString(data.timeline, language);

  const problemPoints = (data.problemPoints || []).map((p) =>
    resolveLocalizedString(p, language)
  );
  const solutionPoints = (data.solutionPoints || []).map((p) =>
    resolveLocalizedString(p, language)
  );

  const coreMetricLabel = data.coreMetric
    ? resolveLocalizedString(data.coreMetric.label, language)
    : '';
  const coreMetricDesc = data.coreMetric
    ? resolveLocalizedString(data.coreMetric.description, language)
    : '';

  return (
    <section className={`relative w-full py-8 sm:py-12 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/25 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Summary
          </span>
          <h2 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            {sectionTitle}
          </h2>
        </motion.div>

        {/* Metadata Pills Header (if role/timeline/coreMetric exists) */}
        {(role || timeline || data.coreMetric) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-[#0f172a]/60 border-slate-800'
            }`}
          >
            {role && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Role & Scope
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      isLightMode ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {role}
                  </div>
                </div>
              </div>
            )}

            {timeline && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Timeline
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      isLightMode ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {timeline}
                  </div>
                </div>
              </div>
            )}

            {data.coreMetric && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {coreMetricLabel || 'Core Impact'}
                  </div>
                  <div className="font-['Space_Grotesk',sans-serif] font-bold text-base text-emerald-400">
                    {data.coreMetric.value}
                    {coreMetricDesc && (
                      <span className="text-xs text-slate-400 font-normal ml-1.5">
                        ({coreMetricDesc})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 2-Column Problem & Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all shadow-xl ${
              isLightMode
                ? 'bg-rose-50/40 border-rose-200 shadow-rose-500/5'
                : 'bg-gradient-to-br from-[#1a1118]/80 to-[#0f172a]/90 border-rose-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-rose-400">
                {language === 'vi' ? 'Vấn đề & Bối cảnh' : 'The Problem'}
              </h3>
            </div>

            <p
              className={`font-['DM_Sans',sans-serif] text-base leading-relaxed mb-6 text-pretty ${
                isLightMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {problem}
            </p>

            {problemPoints.length > 0 && (
              <ul className="space-y-2.5 pt-4 border-t border-rose-500/20">
                {problemPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    <span className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all shadow-xl ${
              isLightMode
                ? 'bg-teal-50/40 border-teal-200 shadow-teal-500/5'
                : 'bg-gradient-to-br from-[#0c1f24]/80 to-[#0f172a]/90 border-teal-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(13,148,136,0.2)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-bold text-teal-400">
                {language === 'vi' ? 'Giải pháp & Tiếp cận' : 'The Solution'}
              </h3>
            </div>

            <p
              className={`font-['DM_Sans',sans-serif] text-base leading-relaxed mb-6 text-pretty ${
                isLightMode ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {solution}
            </p>

            {solutionPoints.length > 0 && (
              <ul className="space-y-2.5 pt-4 border-t border-teal-500/20">
                {solutionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
