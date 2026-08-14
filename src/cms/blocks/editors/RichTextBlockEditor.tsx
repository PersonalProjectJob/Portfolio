import React, { useState } from 'react';
import {
  Eye,
  Edit3,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  Code,
  Link as LinkIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { RichTextBlockData } from '../../types/blocks.types';
import { LocalizedInput } from './common/EditorField';

interface RichTextBlockEditorProps {
  data: RichTextBlockData;
  onChange: (newData: RichTextBlockData) => void;
}

export const RichTextBlockEditor: React.FC<RichTextBlockEditorProps> = ({ data, onChange }) => {
  const [activeLang, setActiveLang] = useState<'en' | 'vi'>('en');
  const [previewMode, setPreviewMode] = useState(false);

  const updateSectionTitle = (newTitle: { en: string; vi: string }) => {
    onChange({
      ...data,
      sectionTitle: newTitle,
    });
  };

  const currentContent = activeLang === 'en' ? (data.body?.en ?? '') : (data.body?.vi ?? '');

  const setContent = (val: string) => {
    onChange({
      ...data,
      body: {
        en: activeLang === 'en' ? val : (data.body?.en ?? ''),
        vi: activeLang === 'vi' ? val : (data.body?.vi ?? ''),
      },
    });
  };

  // Helper to insert markdown syntax at cursor / text
  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('richtext-editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setContent(currentContent + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentContent.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);

    setContent(nextContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
  const charCount = currentContent.length;

  return (
    <div className="space-y-4 text-slate-100">
      {/* Section Title */}
      <LocalizedInput
        label="Section Title"
        value={data.sectionTitle || { en: 'Deep Dive & Findings', vi: 'Phân Tích Chi Tiết' }}
        onChange={updateSectionTitle}
        placeholderEn="e.g. System Architecture & Handoff"
        placeholderVi="e.g. Kiến Trúc Hệ Thống & Bàn Giao"
      />

      {/* Editor Surface Header with Language & Preview Toggles */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
        {/* Toolbar Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 border-b border-slate-800/80">
          {/* Left: Language Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇬🇧 English ({data.body?.en?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('vi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeLang === 'vi'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇻🇳 Tiếng Việt ({data.body?.vi?.length || 0})
            </button>
          </div>

          {/* Right: Markdown Formatting Tools & Preview Mode */}
          <div className="flex items-center gap-1.5">
            {!previewMode && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Inline Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[link title](', ')')}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Add Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Toggle Preview Button */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                previewMode
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {previewMode ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Raw</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Body or Live Rendered Markdown */}
        <div className="p-3">
          {previewMode ? (
            <div className="min-h-[220px] max-h-[420px] overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/80 prose prose-invert prose-sm max-w-none">
              {currentContent ? (
                <ReactMarkdown>{currentContent}</ReactMarkdown>
              ) : (
                <div className="text-slate-500 italic text-xs py-8 text-center">
                  (No content written in {activeLang.toUpperCase()} yet)
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="richtext-editor-textarea"
              value={currentContent}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                activeLang === 'en'
                  ? 'Write your case study markdown here (# Heading, **bold**, lists, code blocks)...'
                  : 'Nhập nội dung bài viết định dạng Markdown tại đây (# Tiêu đề, **in đậm**, danh sách)...'
              }
              rows={10}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all leading-relaxed resize-y"
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>{charCount} chars</span>
          </div>
          <div className="text-teal-400/80">
            {activeLang === 'en' ? 'Editing English' : 'Đang sửa Tiếng Việt'}
          </div>
        </div>
      </div>
    </div>
  );
};
