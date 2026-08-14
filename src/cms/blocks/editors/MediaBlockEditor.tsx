import React from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  SplitSquareVertical,
  Copy,
} from 'lucide-react';
import type { MediaBlockData, MediaItem } from '../../types/blocks.types';
import { LocalizedInput, ImageUrlPicker } from './common/EditorField';
import { CustomSelect } from '../../../admin/components/CustomSelect';

interface MediaBlockEditorProps {
  data: MediaBlockData;
  onChange: (newData: MediaBlockData) => void;
}

const ASPECT_RATIOS: Array<{ value: MediaItem['aspectRatio']; label: string }> = [
  { value: '16/9', label: '16:9 (Widescreen)' },
  { value: '4/3', label: '4:3 (Standard)' },
  { value: '1/1', label: '1:1 (Square)' },
  { value: '21/9', label: '21:9 (Ultrawide)' },
  { value: 'auto', label: 'Auto (Intrinsic)' },
];

export const MediaBlockEditor: React.FC<MediaBlockEditorProps> = ({ data, onChange }) => {
  const items = data.items || [];

  const updateSectionTitle = (newTitle: { en: string; vi: string }) => {
    onChange({
      ...data,
      sectionTitle: newTitle,
    });
  };

  const updateItems = (newItems: MediaItem[]) => {
    onChange({
      ...data,
      items: newItems,
    });
  };

  const addItem = () => {
    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url: '',
      caption: { en: '', vi: '' },
      aspectRatio: '16/9',
      isBeforeAfter: false,
      beforeUrl: '',
      afterUrl: '',
      beforeLabel: { en: 'Before (Legacy UI)', vi: 'Trước (Giao diện cũ)' },
      afterLabel: { en: 'After (Redesigned UI)', vi: 'Sau (Giao diện mới)' },
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (index: number, updatedItem: MediaItem) => {
    const next = [...items];
    next[index] = updatedItem;
    updateItems(next);
  };

  const removeItem = (index: number) => {
    updateItems(items.filter((_, idx) => idx !== index));
  };

  const duplicateItem = (index: number) => {
    const itemToDup = items[index];
    const newItem: MediaItem = {
      ...itemToDup,
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      caption: { ...itemToDup.caption },
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
        value={data.sectionTitle || { en: 'Visual Design & Prototypes', vi: 'Thiết Kế & Bản Mẫu' }}
        onChange={updateSectionTitle}
        placeholderEn="e.g. Interactive UI Gallery"
        placeholderVi="e.g. Thư Viện Giao Diện Tương Tác"
      />

      {/* Media Items Header */}
      <div className="flex items-center justify-between pt-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
          <span>Media Items & Showcases ({items.length})</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold hover:bg-teal-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Media</span>
        </button>
      </div>

      {/* Media Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No media items added yet. Click "Add Media" above to upload or paste URLs.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3.5 transition-all shadow-md"
            >
              {/* Item Top Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {item.isBeforeAfter ? 'Before & After Comparison' : 'Standard Image'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode Toggle: Standard vs Before/After */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <SplitSquareVertical className="w-4 h-4 text-teal-400" />
                  <span>Interactive Before / After Slider</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateItem(index, {
                      ...item,
                      isBeforeAfter: !item.isBeforeAfter,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    item.isBeforeAfter ? 'bg-teal-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.isBeforeAfter ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Conditional Inputs: Standard Image vs Before/After Pair */}
              {item.isBeforeAfter ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-xl bg-slate-900/30 border border-slate-800">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                      Before Version
                    </span>
                    <ImageUrlPicker
                      label="Before Image URL"
                      value={item.beforeUrl || ''}
                      onChange={(url) => updateItem(index, { ...item, beforeUrl: url })}
                      placeholder="e.g. /assets/legacy-ui.png"
                    />
                    <LocalizedInput
                      label="Before Label"
                      value={item.beforeLabel || { en: 'Before', vi: 'Trước' }}
                      onChange={(val) => updateItem(index, { ...item, beforeLabel: val })}
                      placeholderEn="Before (Legacy)"
                      placeholderVi="Trước (Cũ)"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                      After Version
                    </span>
                    <ImageUrlPicker
                      label="After Image URL"
                      value={item.afterUrl || ''}
                      onChange={(url) => updateItem(index, { ...item, afterUrl: url })}
                      placeholder="e.g. /assets/redesigned-ui.png"
                    />
                    <LocalizedInput
                      label="After Label"
                      value={item.afterLabel || { en: 'After', vi: 'Sau' }}
                      onChange={(val) => updateItem(index, { ...item, afterLabel: val })}
                      placeholderEn="After (Redesigned)"
                      placeholderVi="Sau (Mới)"
                    />
                  </div>
                </div>
              ) : (
                <ImageUrlPicker
                  label="Showcase Image URL"
                  value={item.url || ''}
                  onChange={(url) => updateItem(index, { ...item, url })}
                  placeholder="https://images.unsplash.com/... or /assets/..."
                />
              )}

              {/* Caption & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <LocalizedInput
                    label="Image Caption / Description"
                    value={item.caption || { en: '', vi: '' }}
                    onChange={(val) => updateItem(index, { ...item, caption: val })}
                    placeholderEn="Describe what this screenshot highlights..."
                    placeholderVi="Mô tả điểm nổi bật trong ảnh giao diện..."
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Aspect Ratio"
                    value={item.aspectRatio || '16/9'}
                    onChange={(val) =>
                      updateItem(index, {
                        ...item,
                        aspectRatio: val as MediaItem['aspectRatio'],
                      })
                    }
                    options={ASPECT_RATIOS.map((ar) => ({
                      value: ar.value,
                      label: ar.label,
                    }))}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
