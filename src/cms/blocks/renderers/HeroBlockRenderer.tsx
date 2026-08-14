import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, Calendar, User } from 'lucide-react';
import type { HeroBlockData } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

export interface HeroBlockRendererProps {
  data: HeroBlockData;
  className?: string;
}

export const HeroBlockRenderer: React.FC<HeroBlockRendererProps> = ({ data, className = '' }) => {
  const { isLightMode, language } = useStore();

  const title = resolveLocalizedString(data.title, language);
  const subtitle = resolveLocalizedString(data.subtitle, language);
  const eyebrow = resolveLocalizedString(data.eyebrow, language);
  const tags = data.tags || [];
  const metrics = data.metrics || [];

  return (
    <section className={`relative w-full py-8 sm:py-14 ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto">
        {/* Eyebrow & Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-2.5 mb-6"
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_15px_rgba(13,148,136,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              {eyebrow}
            </span>
          )}

          {data.category && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                isLightMode
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
              }`}
            >
              <Tag className="w-3 h-3 text-teal-500" />
              {data.category}
            </span>
          )}

          {data.date && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                isLightMode
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/40'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {data.date}
            </span>
          )}
        </motion.div>

        {/* Display Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-balance"
        >
          {title}
        </motion.h1>

        {/* Subtitle / Summary */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`font-['DM_Sans',sans-serif] text-lg sm:text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl text-pretty ${
              isLightMode ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Meta Pills (Role & Tags) */}
        {(data.role || tags.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 pt-2 pb-6 text-xs sm:text-sm"
          >
            {data.role && (
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
                  isLightMode
                    ? 'bg-white/80 border-slate-200 text-slate-700'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <User className="w-3.5 h-3.5 text-teal-500" />
                <span>Role: <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>{data.role}</strong></span>
              </div>
            )}

            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Cover Image with Glass Frame & Ambient Teal Glow */}
        {data.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative my-8 rounded-3xl overflow-hidden border backdrop-blur-xl shadow-2xl transition-all ${
              isLightMode
                ? 'bg-white/80 border-slate-200 shadow-slate-300/60'
                : 'bg-[#0f172a]/80 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-teal-500/30'
            }`}
          >
            <img
              src={data.coverImage}
              alt={title}
              loading="lazy"
              className="w-full h-auto max-h-[560px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* Highlight Metrics Grid */}
        {metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-6 rounded-3xl border backdrop-blur-2xl ${
              isLightMode
                ? 'bg-white/80 border-slate-200 shadow-lg shadow-slate-200/50'
                : 'bg-[#0f172a]/70 border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            {metrics.map((m, idx) => {
              const label = resolveLocalizedString(m.label, language);
              const note = resolveLocalizedString(m.note, language);
              return (
                <div key={idx} className="flex flex-col">
                  <span className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-amber-300 tracking-tight">
                    {m.value}
                  </span>
                  <span
                    className={`font-['DM_Sans',sans-serif] text-xs sm:text-sm font-semibold mt-1 ${
                      isLightMode ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {label}
                  </span>
                  {note && (
                    <span className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      {note}
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};
