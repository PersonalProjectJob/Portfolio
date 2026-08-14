import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Users,
  Target,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { StatsBlockData, StatCard } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

const ICON_MAP: Record<string, LucideIcon> = {
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  activity: Activity,
  zap: Zap,
  users: Users,
  target: Target,
  clock: Clock,
  shield: ShieldCheck,
  award: Award,
  sparkles: Sparkles,
};

export interface StatsBlockRendererProps {
  data: StatsBlockData;
  className?: string;
}

export const StatsBlockRenderer: React.FC<StatsBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle = resolveLocalizedString(data.sectionTitle, language);
  const subtitle = resolveLocalizedString(data.subtitle, language);
  const cards = data.cards || [];
  const columns = data.columns || 3;

  const getColClass = () => {
    if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

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

        {/* Stats Grid */}
        <div className={`grid gap-5 ${getColClass()}`}>
          {cards.map((card: StatCard, idx: number) => {
            const label = resolveLocalizedString(card.label, language);
            const note = resolveLocalizedString(card.note, language);
            const IconComponent = card.icon ? ICON_MAP[card.icon.toLowerCase()] || Activity : Activity;

            const isPositive =
              card.trend === 'up' || (card.change && card.change.startsWith('+'));
            const isNegative =
              card.trend === 'down' || (card.change && card.change.startsWith('-'));

            return (
              <motion.div
                key={card.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-6 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${
                  isLightMode
                    ? 'bg-white/85 border-slate-200 hover:border-teal-500/40 shadow-lg shadow-slate-200/60'
                    : 'bg-[#0f172a]/75 border-slate-800/90 hover:border-teal-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                }`}
              >
                {/* Glow Backdrop */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${
                      isLightMode
                        ? 'bg-teal-50 text-teal-600 border-teal-200'
                        : 'bg-teal-950/40 text-teal-400 border-teal-500/30'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {card.change && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isNegative
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-700/40'
                      }`}
                    >
                      {isPositive && <TrendingUp className="w-3 h-3" />}
                      {isNegative && <TrendingDown className="w-3 h-3" />}
                      {card.change}
                    </span>
                  )}
                </div>

                {/* Big Number */}
                <div className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-amber-300 mb-2">
                  {card.value}
                </div>

                {/* Label */}
                <div
                  className={`font-['DM_Sans',sans-serif] font-bold text-sm sm:text-base leading-snug ${
                    isLightMode ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {label}
                </div>

                {/* Optional Note */}
                {note && (
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {note}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
