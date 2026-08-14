import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Search,
  Compass,
  Layout,
  Code,
  TestTube,
  Rocket,
  Zap,
  Sliders,
  Database,
  Shield,
  Layers,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ProcessStepsBlockData, ProcessStepItem } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

const STEP_ICON_MAP: Record<string, LucideIcon> = {
  search: Search,
  compass: Compass,
  layout: Layout,
  code: Code,
  test: TestTube,
  rocket: Rocket,
  zap: Zap,
  sliders: Sliders,
  database: Database,
  shield: Shield,
  layers: Layers,
  sparkles: Sparkles,
};

export interface ProcessStepsBlockRendererProps {
  data: ProcessStepsBlockData;
  className?: string;
}

export const ProcessStepsBlockRenderer: React.FC<ProcessStepsBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle = resolveLocalizedString(data.sectionTitle, language);
  const subtitle = resolveLocalizedString(data.subtitle, language);
  const steps = data.steps || [];

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
            className="mb-10"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30 mb-3">
              <Layers className="w-3.5 h-3.5" />
              Methodology & Workflow
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

        {/* Steps Timeline Flow */}
        <div className="relative">
          {/* Vertical Continuous Line for Desktop & Mobile */}
          <div className="absolute top-6 bottom-6 left-6 md:left-8 w-0.5 bg-gradient-to-b from-teal-500 via-teal-400/60 to-amber-500/40 pointer-events-none" />

          <div className="space-y-8 relative">
            {steps.map((step: ProcessStepItem, idx: number) => {
              const stepNumber = step.stepNumber !== undefined ? step.stepNumber : idx + 1;
              const formattedNumber = String(stepNumber).padStart(2, '0');
              const phase = resolveLocalizedString(step.phase, language);
              const title = resolveLocalizedString(step.title, language);
              const description = resolveLocalizedString(step.description, language);
              const deliverables = step.deliverables || [];

              const IconComponent = step.icon
                ? STEP_ICON_MAP[step.icon.toLowerCase()] || Zap
                : Zap;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  className="flex items-start gap-4 sm:gap-6 group"
                >
                  {/* Step Number Circle Badge with Glowing Ring */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white font-['Space_Grotesk',sans-serif] font-extrabold text-base sm:text-xl flex items-center justify-center shadow-[0_0_20px_rgba(13,148,136,0.35)] border-2 border-white/20 transition-transform group-hover:scale-105 z-10 relative">
                      {formattedNumber}
                    </div>
                  </div>

                  {/* Step Content Card */}
                  <div
                    className={`flex-1 p-6 sm:p-7 rounded-3xl border backdrop-blur-xl transition-all duration-300 group-hover:border-teal-500/40 ${
                      isLightMode
                        ? 'bg-white/85 border-slate-200 shadow-lg shadow-slate-200/50'
                        : 'bg-[#0f172a]/75 border-slate-800/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      {phase && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {phase}
                        </span>
                      )}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          isLightMode
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-teal-400" />
                      </div>
                    </div>

                    <h3 className="font-['Space_Grotesk',sans-serif] text-lg sm:text-xl font-bold mb-2">
                      {title}
                    </h3>

                    {description && (
                      <p
                        className={`font-['DM_Sans',sans-serif] text-sm sm:text-base leading-relaxed mb-4 text-pretty ${
                          isLightMode ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        {description}
                      </p>
                    )}

                    {deliverables.length > 0 && (
                      <div className="pt-4 border-t border-slate-800/40">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          {language === 'vi' ? 'Sản phẩm bàn giao:' : 'Key Deliverables:'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {deliverables.map((item, dIdx) => (
                            <span
                              key={dIdx}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
                                isLightMode
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-slate-900/90 text-slate-300 border-slate-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
