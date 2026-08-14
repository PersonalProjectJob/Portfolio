import React from 'react';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  Quote,
  Sparkles,
} from 'lucide-react';
import type { CalloutBlockData, CalloutVariant, CalloutGlowColor } from '../../types/blocks.types';
import { LocalizedInput, SingleInput } from './common/EditorField';

interface CalloutBlockEditorProps {
  data: CalloutBlockData;
  onChange: (newData: CalloutBlockData) => void;
}

const VARIANTS: Array<{
  id: CalloutVariant;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}> = [
  { id: 'info', label: 'Info Note', icon: Info, colorClass: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  { id: 'tip', label: 'Pro Tip', icon: Lightbulb, colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { id: 'warning', label: 'Caution / Warning', icon: AlertTriangle, colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'quote', label: 'Quote / Testimonial', icon: Quote, colorClass: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
];

const GLOW_COLORS: Array<{
  id: CalloutGlowColor;
  label: string;
  dotColor: string;
  ringClass: string;
}> = [
  { id: 'cyan', label: 'Cyan Teal', dotColor: 'bg-cyan-400', ringClass: 'ring-cyan-500/50' },
  { id: 'emerald', label: 'Emerald', dotColor: 'bg-emerald-400', ringClass: 'ring-emerald-500/50' },
  { id: 'amber', label: 'Amber Gold', dotColor: 'bg-amber-400', ringClass: 'ring-amber-500/50' },
  { id: 'purple', label: 'Purple Violet', dotColor: 'bg-purple-400', ringClass: 'ring-purple-500/50' },
  { id: 'blue', label: 'Electric Blue', dotColor: 'bg-blue-400', ringClass: 'ring-blue-500/50' },
  { id: 'rose', label: 'Neon Rose', dotColor: 'bg-rose-400', ringClass: 'ring-rose-500/50' },
];

export const CalloutBlockEditor: React.FC<CalloutBlockEditorProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof CalloutBlockData>(field: K, val: CalloutBlockData[K]) => {
    onChange({
      ...data,
      [field]: val,
    });
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title (Optional) */}
      <LocalizedInput
        label="Section Title (Optional)"
        value={data.sectionTitle || { en: 'Key Takeaway', vi: 'Điểm Nhấn Cốt Lõi' }}
        onChange={(val) => updateField('sectionTitle', val)}
        placeholderEn="e.g. Key Takeaway & Recommendation"
        placeholderVi="e.g. Điểm Nhấn Cốt Lõi & Lời Khuyên"
      />

      {/* Variant Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Callout Style & Variant</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VARIANTS.map((v) => {
            const Icon = v.icon;
            const isSelected = (data.variant || 'tip') === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => updateField('variant', v.id)}
                className={`h-12 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? `${v.colorClass} shadow-md`
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glow Accent Color Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Ambient Glow Color</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GLOW_COLORS.map((g) => {
            const isSelected = (data.glowColor || 'cyan') === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => updateField('glowColor', g.id)}
                className={`h-10 px-2 rounded-xl flex items-center justify-center gap-2 text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? `bg-slate-800 text-white border-slate-600 ring-2 ${g.ringClass} shadow-lg`
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${g.dotColor} shrink-0 shadow-sm`} />
                <span className="truncate text-[11px]">{g.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Callout Body Content (EN/VI) */}
      <LocalizedInput
        label="Callout Narrative / Quote Text"
        value={data.text || { en: '', vi: '' }}
        onChange={(val) => updateField('text', val)}
        placeholderEn="Enter prominent takeaway, key principle, or quote text..."
        placeholderVi="Nhập nội dung ghi chú quan trọng hoặc câu nói nổi bật..."
        isTextarea
        rows={3}
        required
      />

      {/* Author & Role (Useful for quotes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <SingleInput
          label="Author / Speaker (Optional)"
          value={data.author || ''}
          onChange={(val) => updateField('author', val)}
          placeholder="e.g. John Doe, VP of Product"
        />

        <SingleInput
          label="Role / Attribution"
          value={data.role || ''}
          onChange={(val) => updateField('role', val)}
          placeholder="e.g. Lead Architect, Fintech Co."
        />
      </div>
    </div>
  );
};
