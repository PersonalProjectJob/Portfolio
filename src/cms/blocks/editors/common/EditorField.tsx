import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import type { LocalizedString } from '../../../types/cms.types';

interface LocalizedInputProps {
  label: string;
  value: LocalizedString;
  onChange: (val: LocalizedString) => void;
  placeholderEn?: string;
  placeholderVi?: string;
  isTextarea?: boolean;
  rows?: number;
  description?: string;
  required?: boolean;
}

export const LocalizedInput: React.FC<LocalizedInputProps> = ({
  label,
  value,
  onChange,
  placeholderEn = 'Enter English content...',
  placeholderVi = 'Nhập nội dung Tiếng Việt...',
  isTextarea = false,
  rows = 3,
  description,
  required = false,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'vi'>('en');

  const handleEnChange = (newEn: string) => {
    onChange({
      en: newEn,
      vi: value?.vi ?? '',
    });
  };

  const handleViChange = (newVi: string) => {
    onChange({
      en: value?.en ?? '',
      vi: newVi,
    });
  };

  const currentVal = activeLang === 'en' ? (value?.en ?? '') : (value?.vi ?? '');
  const placeholder = activeLang === 'en' ? placeholderEn : placeholderVi;

  return (
    <div className="space-y-1.5 w-full">
      {/* Label and Language Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
          {description && (
            <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
              ({description})
            </span>
          )}
        </label>

        {/* EN / VI Pill Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              activeLang === 'en'
                ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('vi')}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              activeLang === 'vi'
                ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇻🇳 VI
          </button>
        </div>
      </div>

      {/* Input / Textarea */}
      <div className="relative">
        {isTextarea ? (
          <textarea
            value={currentVal}
            onChange={(e) => {
              if (activeLang === 'en') handleEnChange(e.target.value);
              else handleViChange(e.target.value);
            }}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans leading-relaxed resize-y"
          />
        ) : (
          <input
            type="text"
            value={currentVal}
            onChange={(e) => {
              if (activeLang === 'en') handleEnChange(e.target.value);
              else handleViChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
          />
        )}

        {/* Indicator if the other language is missing */}
        <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5 pointer-events-none opacity-60">
          {activeLang === 'en' && !value?.vi && (
            <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
              VI missing
            </span>
          )}
          {activeLang === 'vi' && !value?.en && (
            <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
              EN missing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface SingleInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  description?: string;
  required?: boolean;
}

export const SingleInput: React.FC<SingleInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  description,
  required = false,
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
        <span>{label}</span>
        {required && <span className="text-rose-400">*</span>}
        {description && (
          <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
            ({description})
          </span>
        )}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
      />
    </div>
  );
};

interface ImageUrlPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  description?: string;
}

export const ImageUrlPicker: React.FC<ImageUrlPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://images.unsplash.com/... or /assets/...',
  description,
}) => {
  return (
    <div className="space-y-2 w-full">
      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
          {label}
        </span>
        {description && <span className="text-[11px] text-slate-500">{description}</span>}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-11 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all font-mono"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
            title="Clear Image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Thumbnail Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-40 flex items-center justify-center group">
          <img
            src={value}
            alt="Preview"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            }}
            className="w-full h-36 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none flex items-end p-2">
            <span className="text-[10px] text-slate-300 font-mono truncate">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Type tag and press Enter...',
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-semibold text-slate-300">{label}</label>

      <div className="min-h-11 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center gap-1.5 focus-within:border-teal-500/50 transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex-1 flex items-center min-w-[120px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) addTag(inputValue);
            }}
            placeholder={tags.length === 0 ? placeholder : 'Add more...'}
            className="w-full h-8 px-2 bg-transparent text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
