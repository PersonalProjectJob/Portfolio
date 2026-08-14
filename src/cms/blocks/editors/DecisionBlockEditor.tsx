import React from 'react';
import { GitCommit, Plus, Trash2, ChevronUp, ChevronDown, Copy, HelpCircle, Check, BookOpen, Zap } from 'lucide-react';
import type { DecisionBlockData, DecisionItem } from '../../types/blocks.types';
import { LocalizedInput } from './common/EditorField';

interface DecisionBlockEditorProps {
  data: DecisionBlockData;
  onChange: (newData: DecisionBlockData) => void;
}

export const DecisionBlockEditor: React.FC<DecisionBlockEditorProps> = ({ data, onChange }) => {
  const decisions = data.decisions || [];

  const updateSectionTitle = (newTitle: { en: string; vi: string }) => {
    onChange({
      ...data,
      sectionTitle: newTitle,
    });
  };

  const updateDecisions = (newDecisions: DecisionItem[]) => {
    onChange({
      ...data,
      decisions: newDecisions,
    });
  };

  const addDecision = () => {
    const newDecision: DecisionItem = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      problem: {
        en: 'Friction between high-density data tables and mobile screen constraints.',
        vi: 'Khó khăn khi hiển thị bảng dữ liệu mật độ cao trên màn hình điện thoại.',
      },
      choice: {
        en: 'Progressive disclosure card list with swipeable action sheets.',
        vi: 'Danh sách thẻ thông tin mở rộng dần kèm bảng thao tác vuốt.',
      },
      rationale: {
        en: 'Eliminated horizontal scroll fatigue while maintaining 100% data access.',
        vi: 'Loại bỏ hiện tượng mỏi tay khi cuộn ngang mà vẫn truy cập đủ 100% dữ liệu.',
      },
      impact: {
        en: 'Mobile task completion speed increased by 42%.',
        vi: 'Tốc độ hoàn thành thao tác trên di động tăng 42%.',
      },
    };
    updateDecisions([...decisions, newDecision]);
  };

  const updateDecision = (index: number, updated: DecisionItem) => {
    const next = [...decisions];
    next[index] = updated;
    updateDecisions(next);
  };

  const removeDecision = (index: number) => {
    updateDecisions(decisions.filter((_, idx) => idx !== index));
  };

  const duplicateDecision = (index: number) => {
    const itemToDup = decisions[index];
    const newDecision: DecisionItem = {
      ...itemToDup,
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      problem: { ...itemToDup.problem },
      choice: { ...itemToDup.choice },
      rationale: { ...itemToDup.rationale },
      impact: itemToDup.impact ? { ...itemToDup.impact } : undefined,
    };
    const next = [...decisions];
    next.splice(index + 1, 0, newDecision);
    updateDecisions(next);
  };

  const moveDecision = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === decisions.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...decisions];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    updateDecisions(next);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title */}
      <LocalizedInput
        label="Section Title"
        value={data.sectionTitle || { en: 'Key Technical & UX Decisions', vi: 'Các Quyết Định Thiết Kế Then Chốt' }}
        onChange={updateSectionTitle}
        placeholderEn="e.g. Architectural Trade-offs & Logic"
        placeholderVi="e.g. Đánh Đổi Kiến Trúc & Logic Thiết Kế"
      />

      {/* Decisions Header */}
      <div className="flex items-center justify-between pt-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5 text-teal-400" />
          <span>Design Decisions & Trade-offs ({decisions.length})</span>
        </label>
        <button
          type="button"
          onClick={addDecision}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold hover:bg-teal-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Decision</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="space-y-3.5">
        {decisions.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No design decisions added yet. Click "Add Decision" to demonstrate engineering and design maturity.
          </div>
        ) : (
          decisions.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 shadow-md"
            >
              {/* Decision Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-mono font-bold flex items-center justify-center border border-teal-500/30">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[280px]">
                    {item.choice?.en || `Decision #${index + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveDecision(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDecision(index, 'down')}
                    disabled={index === decisions.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateDecision(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDecision(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Problem / Context */}
              <div className="space-y-1.5 p-3 rounded-xl bg-amber-950/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>The Challenge / Dilemma</span>
                </div>
                <LocalizedInput
                  label="Problem Context"
                  value={item.problem || { en: '', vi: '' }}
                  onChange={(val) => updateDecision(index, { ...item, problem: val })}
                  placeholderEn="What was the core trade-off or ambiguity?"
                  placeholderVi="Bối cảnh khó khăn hoặc lựa chọn đánh đổi là gì?"
                  isTextarea
                  rows={2}
                  required
                />
              </div>

              {/* Choice Made */}
              <div className="space-y-1.5 p-3 rounded-xl bg-teal-950/10 border border-teal-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>The Chosen Path</span>
                </div>
                <LocalizedInput
                  label="Decision Choice"
                  value={item.choice || { en: '', vi: '' }}
                  onChange={(val) => updateDecision(index, { ...item, choice: val })}
                  placeholderEn="What direction was selected?"
                  placeholderVi="Phương án nào đã được lựa chọn?"
                  isTextarea
                  rows={2}
                  required
                />
              </div>

              {/* Rationale & Logic */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rationale & Why This Option</span>
                </div>
                <LocalizedInput
                  label="Rationale"
                  value={item.rationale || { en: '', vi: '' }}
                  onChange={(val) => updateDecision(index, { ...item, rationale: val })}
                  placeholderEn="Why did this option outperform alternatives?"
                  placeholderVi="Tại sao phương án này tốt hơn các giải pháp khác?"
                  isTextarea
                  rows={2}
                  required
                />
              </div>

              {/* Result & Impact */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Result & Measurable Impact</span>
                </div>
                <LocalizedInput
                  label="Impact & Validation"
                  value={item.impact || { en: '', vi: '' }}
                  onChange={(val) => updateDecision(index, { ...item, impact: val })}
                  placeholderEn="What was the measured outcome or team feedback?"
                  placeholderVi="Kết quả đo lường hoặc phản hồi nhận được là gì?"
                  isTextarea
                  rows={2}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
