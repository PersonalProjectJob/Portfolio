import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { OverviewBlockData } from '../../types/blocks.types';
import { LocalizedInput, SingleInput } from './common/EditorField';

interface OverviewBlockEditorProps {
  data: OverviewBlockData;
  onChange: (newData: OverviewBlockData) => void;
}

export const OverviewBlockEditor: React.FC<OverviewBlockEditorProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof OverviewBlockData>(field: K, val: OverviewBlockData[K]) => {
    onChange({
      ...data,
      [field]: val,
    });
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title */}
      <LocalizedInput
        label="Section Title"
        value={data.sectionTitle || { en: 'Project Overview', vi: 'Tổng Quan Dự Án' }}
        onChange={(val) => updateField('sectionTitle', val)}
        placeholderEn="e.g. Executive Overview & Scope"
        placeholderVi="e.g. Tổng Quan Điều Hành & Phạm Vi"
      />

      {/* Meta Grid: Role, Timeline, Core Metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <SingleInput
          label="Role"
          value={data.role || ''}
          onChange={(val) => updateField('role', val)}
          placeholder="e.g. Lead UX Architect"
        />

        <SingleInput
          label="Timeline"
          value={data.timeline || ''}
          onChange={(val) => updateField('timeline', val)}
          placeholder="e.g. Q1 2026 (12 weeks)"
        />

        <SingleInput
          label="Core Metric"
          value={data.coreMetric || ''}
          onChange={(val) => updateField('coreMetric', val)}
          placeholder="e.g. +142% Retention"
        />
      </div>

      {/* Problem Statement (EN/VI) */}
      <div className="space-y-2 p-3.5 rounded-2xl bg-rose-950/10 border border-rose-500/20">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>The Problem & Friction Points</span>
        </div>
        <LocalizedInput
          label="Problem Statement"
          value={data.problem || { en: '', vi: '' }}
          onChange={(val) => updateField('problem', val)}
          placeholderEn="Describe user pain points, business friction, and why the project was initiated..."
          placeholderVi="Mô tả các khó khăn của người dùng và lý do khởi tạo dự án..."
          isTextarea
          rows={3}
          required
        />
      </div>

      {/* Solution Statement (EN/VI) */}
      <div className="space-y-2 p-3.5 rounded-2xl bg-teal-950/10 border border-teal-500/20">
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>The Engineered Solution</span>
        </div>
        <LocalizedInput
          label="Solution Architecture"
          value={data.solution || { en: '', vi: '' }}
          onChange={(val) => updateField('solution', val)}
          placeholderEn="Explain the architectural direction, core UX improvements, and end-state deliverable..."
          placeholderVi="Giải thích định hướng kiến trúc, cải tiến UX và giải pháp bàn giao..."
          isTextarea
          rows={3}
          required
        />
      </div>
    </div>
  );
};
