import React from 'react';
import { motion } from 'framer-motion';
import {
  GitFork,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import type { DecisionBlockData, DecisionItem } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

export interface DecisionBlockRendererProps {
  data: DecisionBlockData;
  className?: string;
}

export const DecisionBlockRenderer: React.FC<DecisionBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle = resolveLocalizedString(data.sectionTitle, language);
  const subtitle = resolveLocalizedString(data.subtitle, language);
  const items = data.items || [];

  return (
    <section className={`relative w-full py-8 sm:py-12 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {(sectionTitle || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
              <GitFork className="w-3.5 h-3.5" />
              Architecture & UX Tradeoffs
            </span>
            {sectionTitle && (
              <h2 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                {sectionTitle}
              </h2>
            )}
            {subtitle && (
              <p
                className={`font-['DM_Sans',sans-serif] text-base sm:text-lg ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Decision Cards List */}
        <div className="space-y-8">
          {items.map((item: DecisionItem, idx: number) => {
            const problem = resolveLocalizedString(item.problem, language);
            const decision = resolveLocalizedString(item.decision, language);
            const impact = resolveLocalizedString(item.impact, language);
            const why = resolveLocalizedString(item.why, language);
            const options = item.options || [];

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-all shadow-xl ${
                  isLightMode
                    ? 'bg-white/90 border-slate-200 shadow-slate-200/60'
                    : 'bg-[#0f172a]/80 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
                }`}
              >
                {/* Decision Header: Problem Context */}
                <div className="flex items-start gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                      {language === 'vi' ? 'Bài toán & Đánh đổi' : 'Problem & Tradeoff Context'}
                    </span>
                    <h3 className="font-['Space_Grotesk',sans-serif] text-lg sm:text-xl font-bold mt-1">
                      {problem}
                    </h3>
                  </div>
                </div>

                {/* Options Considered Grid */}
                {options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {options.map((opt, optIdx) => {
                      const isSelected = Boolean(opt.selected);
                      return (
                        <div
                          key={optIdx}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isSelected
                              ? isLightMode
                                ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400'
                                : 'bg-teal-950/20 border-teal-500/40 ring-1 ring-teal-500/40'
                              : isLightMode
                                ? 'bg-slate-50/80 border-slate-200 opacity-80'
                                : 'bg-slate-900/60 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="font-semibold text-sm sm:text-base font-['Space_Grotesk',sans-serif]">
                              {opt.title}
                            </span>
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/40">
                                <Check className="w-3 h-3" />
                                {language === 'vi' ? 'Lựa chọn' : 'Chosen'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">
                                {language === 'vi' ? 'Phương án thay thế' : 'Alternative'}
                              </span>
                            )}
                          </div>

                          {/* Pros */}
                          {opt.pros && opt.pros.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                              {opt.pros.map((pro, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-2 text-xs leading-relaxed text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>{pro}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Cons */}
                          {opt.cons && opt.cons.length > 0 && (
                            <div className="space-y-1.5">
                              {opt.cons.map((con, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-2 text-xs leading-relaxed text-rose-400">
                                  <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>{con}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Final Decision & "Why this choice" */}
                <div
                  className={`p-5 rounded-2xl border mb-4 ${
                    isLightMode
                      ? 'bg-teal-50/50 border-teal-200'
                      : 'bg-gradient-to-r from-teal-950/30 to-slate-900/60 border-teal-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Quyết định chốt' : 'Final Architecture Decision'}</span>
                  </div>
                  <p
                    className={`font-['DM_Sans',sans-serif] text-sm sm:text-base font-semibold ${
                      isLightMode ? 'text-slate-800' : 'text-slate-100'
                    }`}
                  >
                    {decision}
                  </p>
                  {why && (
                    <p
                      className={`text-xs sm:text-sm mt-2 leading-relaxed italic ${
                        isLightMode ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      &ldquo;{why}&rdquo;
                    </p>
                  )}
                </div>

                {/* Impact Badge */}
                {impact && (
                  <div className="flex items-center gap-2 pt-2 text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-400">
                      {language === 'vi' ? 'Tác động đo lường:' : 'Measured Impact:'}
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        isLightMode ? 'text-slate-800' : 'text-amber-300'
                      }`}
                    >
                      {impact}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
