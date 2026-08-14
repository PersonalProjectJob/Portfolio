import React from 'react';
import { GitMerge, Plus, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import type { ProcessStepsBlockData, ProcessStepItem } from '../../types/blocks.types';
import { LocalizedInput, TagInput } from './common/EditorField';

interface ProcessStepsBlockEditorProps {
  data: ProcessStepsBlockData;
  onChange: (newData: ProcessStepsBlockData) => void;
}

export const ProcessStepsBlockEditor: React.FC<ProcessStepsBlockEditorProps> = ({ data, onChange }) => {
  const steps = data.steps || [];

  const updateSectionTitle = (newTitle: { en: string; vi: string }) => {
    onChange({
      ...data,
      sectionTitle: newTitle,
    });
  };

  const updateSteps = (newSteps: ProcessStepItem[]) => {
    // Re-index step numbers
    const indexed = newSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
    }));
    onChange({
      ...data,
      steps: indexed,
    });
  };

  const addStep = () => {
    const nextNum = steps.length + 1;
    const newStep: ProcessStepItem = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stepNumber: nextNum,
      title: { en: `Phase 0${nextNum}: Step Title`, vi: `Giai Đoạn 0${nextNum}: Tiêu Đề Bước` },
      description: {
        en: 'Detailed overview of research, methodology, and technical execution...',
        vi: 'Mô tả chi tiết phương pháp tiếp cận và triển khai kỹ thuật...',
      },
      deliverables: ['Figma Prototype', 'Token Mapping'],
    };
    updateSteps([...steps, newStep]);
  };

  const updateStep = (index: number, updatedStep: ProcessStepItem) => {
    const next = [...steps];
    next[index] = updatedStep;
    updateSteps(next);
  };

  const removeStep = (index: number) => {
    updateSteps(steps.filter((_, idx) => idx !== index));
  };

  const duplicateStep = (index: number) => {
    const stepToDup = steps[index];
    const newStep: ProcessStepItem = {
      ...stepToDup,
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: { ...stepToDup.title },
      description: { ...stepToDup.description },
      deliverables: [...(stepToDup.deliverables || [])],
    };
    const next = [...steps];
    next.splice(index + 1, 0, newStep);
    updateSteps(next);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...steps];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    updateSteps(next);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title */}
      <LocalizedInput
        label="Section Title"
        value={data.sectionTitle || { en: 'Design & Engineering Process', vi: 'Quy Trình Thiết Kế & Kỹ Thuật' }}
        onChange={updateSectionTitle}
        placeholderEn="e.g. End-to-End Methodology"
        placeholderVi="e.g. Quy Trình Phát Triển Toàn Diện"
      />

      {/* Steps Header */}
      <div className="flex items-center justify-between pt-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <GitMerge className="w-3.5 h-3.5 text-teal-400" />
          <span>Workflow Steps & Phases ({steps.length})</span>
        </label>
        <button
          type="button"
          onClick={addStep}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold hover:bg-teal-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-3.5">
        {steps.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No process steps added yet. Click "Add Step" to document workflow phases.
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 shadow-md"
            >
              {/* Step Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-mono font-bold flex items-center justify-center border border-teal-500/30">
                    {step.stepNumber || index + 1}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {step.title?.en || `Step ${index + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateStep(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step Title (EN/VI) */}
              <LocalizedInput
                label="Step Title"
                value={step.title || { en: '', vi: '' }}
                onChange={(val) => updateStep(index, { ...step, title: val })}
                placeholderEn="e.g. Discovery & Quantitative Telemetry"
                placeholderVi="e.g. Khám Phá & Đánh Giá Dữ Liệu"
                required
              />

              {/* Step Description (EN/VI) */}
              <LocalizedInput
                label="Step Narrative & Process"
                value={step.description || { en: '', vi: '' }}
                onChange={(val) => updateStep(index, { ...step, description: val })}
                placeholderEn="Explain key actions taken, tools used, and hypotheses tested..."
                placeholderVi="Mô tả các hành động chính, công cụ sử dụng và giả thuyết kiểm chứng..."
                isTextarea
                rows={2}
                required
              />

              {/* Deliverables Tag Input */}
              <TagInput
                label="Key Deliverables & Artifacts"
                tags={step.deliverables || []}
                onChange={(tags) => updateStep(index, { ...step, deliverables: tags })}
                placeholder="Add deliverable (e.g. Figma Token Kit) and press Enter"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
