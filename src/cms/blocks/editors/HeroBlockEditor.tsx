import React from 'react';
import type { HeroBlockData } from '../../types/blocks.types';
import { LocalizedInput, SingleInput, ImageUrlPicker, TagInput } from './common/EditorField';

interface HeroBlockEditorProps {
  data: HeroBlockData;
  onChange: (newData: HeroBlockData) => void;
}

export const HeroBlockEditor: React.FC<HeroBlockEditorProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof HeroBlockData>(field: K, val: HeroBlockData[K]) => {
    onChange({
      ...data,
      [field]: val,
    });
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Eyebrow & Category Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SingleInput
          label="Eyebrow / Badge"
          value={data.eyebrow || ''}
          onChange={(val) => updateField('eyebrow', val)}
          placeholder="e.g. CASE STUDY // 2026"
          description="Small uppercase accent label"
        />

        <SingleInput
          label="Category"
          value={data.category || ''}
          onChange={(val) => updateField('category', val)}
          placeholder="e.g. Product Design / Web3"
          description="Primary domain category"
        />
      </div>

      {/* Main Title (EN / VI) */}
      <LocalizedInput
        label="Project Title"
        value={data.title || { en: '', vi: '' }}
        onChange={(val) => updateField('title', val)}
        placeholderEn="e.g. CryptoMap 360 - Multi-Chain Intelligence"
        placeholderVi="e.g. CryptoMap 360 - Thông Tin Thị Trường Đa Chuỗi"
        required
      />

      {/* Subtitle / Executive Summary (EN / VI) */}
      <LocalizedInput
        label="Subtitle / Lead Narrative"
        value={data.subtitle || { en: '', vi: '' }}
        onChange={(val) => updateField('subtitle', val)}
        placeholderEn="High-level impact summary explaining the core product challenge..."
        placeholderVi="Tóm tắt ngắn gọn mục tiêu và thách thức chính của dự án..."
        isTextarea
        rows={2}
        description="Shown prominently beneath the title"
      />

      {/* Role & Date Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SingleInput
          label="Your Role"
          value={data.role || ''}
          onChange={(val) => updateField('role', val)}
          placeholder="e.g. Lead Product Designer & Design Technologist"
        />

        <SingleInput
          label="Year / Timeline"
          value={data.date || ''}
          onChange={(val) => updateField('date', val)}
          placeholder="e.g. 2026 (12 weeks)"
        />
      </div>

      {/* Cover Image URL Picker */}
      <ImageUrlPicker
        label="Hero Cover / Showcase Image URL"
        value={data.coverImage || ''}
        onChange={(url) => updateField('coverImage', url)}
        placeholder="https://images.unsplash.com/... or /assets/case-studies/..."
        description="Main high-res banner preview"
      />

      {/* Tags Input */}
      <TagInput
        label="Skills & Topic Tags"
        tags={data.tags || []}
        onChange={(tags) => updateField('tags', tags)}
        placeholder="Type tag (e.g. Design Systems, React 19) and press Enter"
      />
    </div>
  );
};
