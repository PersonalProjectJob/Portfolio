import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Quote as QuoteIcon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CalloutBlockData } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

interface CalloutVariantConfig {
  icon: LucideIcon;
  labelEn: string;
  labelVi: string;
  glowColor: string;
  badgeBg: string;
  borderColor: string;
  iconColor: string;
  containerBgDark: string;
  containerBgLight: string;
}

const CALLOUT_VARIANTS: Record<string, CalloutVariantConfig> = {
  insight: {
    icon: Lightbulb,
    labelEn: 'Key Insight',
    labelVi: 'Góc nhìn & Đúc kết then chốt',
    glowColor: 'rgba(13, 148, 136, 0.2)',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    borderColor: 'border-teal-500/30 hover:border-teal-500/50',
    iconColor: 'text-teal-400',
    containerBgDark: 'bg-gradient-to-br from-[#0c1f24]/85 to-[#0f172a]/95',
    containerBgLight: 'bg-teal-50/50',
  },
  quote: {
    icon: QuoteIcon,
    labelEn: 'Stakeholder Quote',
    labelVi: 'Trích dẫn & Lời chứng thực',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    iconColor: 'text-amber-400',
    containerBgDark: 'bg-gradient-to-br from-[#241a0c]/85 to-[#0f172a]/95',
    containerBgLight: 'bg-amber-50/50',
  },
  warning: {
    icon: AlertTriangle,
    labelEn: 'Critical Risk & Constraint',
    labelVi: 'Rủi ro & Ràng buộc Quan trọng',
    glowColor: 'rgba(244, 63, 94, 0.2)',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/30 hover:border-rose-500/50',
    iconColor: 'text-rose-400',
    containerBgDark: 'bg-gradient-to-br from-[#240c14]/85 to-[#0f172a]/95',
    containerBgLight: 'bg-rose-50/50',
  },
  tip: {
    icon: CheckCircle2,
    labelEn: 'Best Practice & Pro Tip',
    labelVi: 'Kinh nghiệm & Thực tiễn Tốt nhất',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    containerBgDark: 'bg-gradient-to-br from-[#0c2417]/85 to-[#0f172a]/95',
    containerBgLight: 'bg-emerald-50/50',
  },
  key_takeaway: {
    icon: Sparkles,
    labelEn: 'Key Takeaway',
    labelVi: 'Bài học đắt giá',
    glowColor: 'rgba(168, 85, 247, 0.2)',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    containerBgDark: 'bg-gradient-to-br from-[#1b0c24]/85 to-[#0f172a]/95',
    containerBgLight: 'bg-purple-50/50',
  },
};

export interface CalloutBlockRendererProps {
  data: CalloutBlockData;
  className?: string;
}

export const CalloutBlockRenderer: React.FC<CalloutBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const variantKey = (data.type || 'insight').toLowerCase();
  const variant = CALLOUT_VARIANTS[variantKey] || CALLOUT_VARIANTS.insight;
  const IconComponent = variant.icon;

  const title =
    resolveLocalizedString(data.title, language) ||
    (language === 'vi' ? variant.labelVi : variant.labelEn);
  const content = resolveLocalizedString(data.content, language);
  const author = data.author;
  const role = data.role;
  const quoteSource = data.quoteSource;

  return (
    <section className={`relative w-full py-6 sm:py-10 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl transition-all shadow-2xl relative overflow-hidden ${
          variant.borderColor
        } ${isLightMode ? `${variant.containerBgLight} border-slate-200` : variant.containerBgDark}`}
        style={{
          boxShadow: `0 10px 40px ${variant.glowColor}`,
        }}
      >
        {/* Glow ambient circle */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: variant.glowColor }}
        />

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
              isLightMode
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <IconComponent className={`w-5 h-5 ${variant.iconColor}`} />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${variant.badgeBg}`}
          >
            {title}
          </span>
        </div>

        {/* Content */}
        <div
          className={`prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed ${
            isLightMode ? 'text-slate-800' : 'text-slate-200'
          }`}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* Optional Author Attribution Footer */}
        {(author || role || quoteSource) && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            {author && (
              <div className="font-semibold">
                <span className={isLightMode ? 'text-slate-900' : 'text-white'}>
                  {author}
                </span>
                {role && (
                  <span className="text-slate-400 font-normal ml-1.5">
                    &bull; {role}
                  </span>
                )}
              </div>
            )}
            {quoteSource && (
              <div className="italic text-slate-400 text-xs">
                Source: {quoteSource}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};
