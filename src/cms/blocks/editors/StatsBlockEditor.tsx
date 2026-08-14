import React from 'react';
import { BarChart3, Plus, Trash2, ChevronUp, ChevronDown, Copy, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import type { StatsBlockData, StatItem } from '../../types/blocks.types';
import { LocalizedInput, SingleInput } from './common/EditorField';

interface StatsBlockEditorProps {
  data: StatsBlockData;
  onChange: (newData: StatsBlockData) => void;
}

export const StatsBlockEditor: React.FC<StatsBlockEditorProps> = ({ data, onChange }) => {
  const items = data.items || [];

  const updateSectionTitle = (newTitle: { en: string; vi: string }) => {
    onChange({
      ...data,
      sectionTitle: newTitle,
    });
  };

  const updateItems = (newItems: StatItem[]) => {
    onChange({
      ...data,
      items: newItems,
    });
  };

  const addItem = () => {
    const newItem: StatItem = {
      id: `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      value: '+50%',
      label: { en: 'Performance Gain', vi: 'Hiệu suất tăng' },
      note: 'Verified in production metrics',
      changeType: 'positive',
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (index: number, updatedItem: StatItem) => {
    const next = [...items];
    next[index] = updatedItem;
    updateItems(next);
  };

  const removeItem = (index: number) => {
    updateItems(items.filter((_, idx) => idx !== index));
  };

  const duplicateItem = (index: number) => {
    const itemToDup = items[index];
    const newItem: StatItem = {
      ...itemToDup,
      id: `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: { ...itemToDup.label },
    };
    const next = [...items];
    next.splice(index + 1, 0, newItem);
    updateItems(next);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    updateItems(next);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title */}
      <LocalizedInput
        label="Section Title"
        value={data.sectionTitle || { en: 'Key Business Impact', vi: 'Tác Động Kinh Doanh' }}
        onChange={updateSectionTitle}
        placeholderEn="e.g. Metrics & Telemetry Outcomes"
        placeholderVi="e.g. Chỉ Số & Đo Lường Kết Quả"
      />

      {/* Stat Items Header */}
      <div className="flex items-center justify-between pt-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
          <span>Metric Highlights Cards ({items.length})</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold hover:bg-teal-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Metric</span>
        </button>
      </div>

      {/* Stat Cards List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No metrics added yet. Click "Add Metric" to highlight key quantifiable results.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 shadow-md"
            >
              {/* Item Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 text-[11px] font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{item.value || '(No Value)'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Value and Trend Indicator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SingleInput
                  label="Metric Value / Number"
                  value={item.value || ''}
                  onChange={(val) => updateItem(index, { ...item, value: val })}
                  placeholder="e.g. +142%, 3.5x, <100ms, $2.4M"
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Trend / Sentiment</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateItem(index, { ...item, changeType: 'positive' })}
                      className={`h-11 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold border transition-all cursor-pointer ${
                        item.changeType === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Positive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItem(index, { ...item, changeType: 'neutral' })}
                      className={`h-11 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold border transition-all cursor-pointer ${
                        item.changeType === 'neutral'
                          ? 'bg-slate-700/40 text-slate-200 border-slate-600 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Neutral</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItem(index, { ...item, changeType: 'negative' })}
                      className={`h-11 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold border transition-all cursor-pointer ${
                        item.changeType === 'negative'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Negative</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Label (EN/VI) */}
              <LocalizedInput
                label="Metric Label / Dimension"
                value={item.label || { en: '', vi: '' }}
                onChange={(val) => updateItem(index, { ...item, label: val })}
                placeholderEn="e.g. Increase in retention rate"
                placeholderVi="e.g. Tăng trưởng tỷ lệ giữ chân khách hàng"
                required
              />

              {/* Note / Context description */}
              <SingleInput
                label="Context / Baseline Note (Optional)"
                value={item.note || ''}
                onChange={(val) => updateItem(index, { ...item, note: val })}
                placeholder="e.g. Measured over 90-day cohort across 50,000 active users"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
