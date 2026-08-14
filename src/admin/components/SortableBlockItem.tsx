import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  FileText,
  Image as ImageIcon,
  BarChart3,
  GitMerge,
  GitCommit,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import type { ContentBlock } from '../../cms/types/cms.types';
import type {
  HeroBlockData,
  OverviewBlockData,
  RichTextBlockData,
  MediaBlockData,
  StatsBlockData,
  ProcessStepsBlockData,
  DecisionBlockData,
  CalloutBlockData,
} from '../../cms/types/blocks.types';
import {
  HeroBlockEditor,
  OverviewBlockEditor,
  RichTextBlockEditor,
  MediaBlockEditor,
  StatsBlockEditor,
  ProcessStepsBlockEditor,
  DecisionBlockEditor,
  CalloutBlockEditor,
} from '../../cms/blocks/editors';

export interface SortableBlockItemProps {
  block: ContentBlock;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (blockId: string) => void;
  onUpdateData: (blockId: string, newData: Record<string, unknown>) => void;
  onToggleVisibility: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onInsertBelow?: (index: number) => void;
}

function normalizeBlockTypeKey(type: string): string {
  const clean = (type || '').toLowerCase().replace(/[_-]/g, '').trim();
  if (clean.includes('hero')) return 'Hero';
  if (clean.includes('overview')) return 'Overview';
  if (clean.includes('richtext') || clean.includes('text') || clean.includes('prose')) return 'RichText';
  if (clean.includes('media') || clean.includes('image') || clean.includes('gallery')) return 'Media';
  if (clean.includes('stat') || clean.includes('metric')) return 'Stats';
  if (clean.includes('step') || clean.includes('process')) return 'ProcessSteps';
  if (clean.includes('decision') || clean.includes('tradeoff')) return 'Decision';
  if (clean.includes('callout') || clean.includes('quote') || clean.includes('insight')) return 'Callout';
  return type;
}

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Hero: Sparkles,
  Overview: Compass,
  RichText: FileText,
  Media: ImageIcon,
  Stats: BarChart3,
  ProcessSteps: GitMerge,
  Decision: GitCommit,
  Callout: AlertTriangle,
};

const BLOCK_THEME_COLORS: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  Hero: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    pill: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  Overview: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  RichText: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  Media: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  Stats: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  ProcessSteps: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  Decision: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  Callout: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

function resolveStringOrLoc(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const loc = val as Record<string, string>;
    return loc.en || loc.vi || Object.values(loc)[0] || '';
  }
  return String(val);
}

export const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  isExpanded,
  onToggleExpand,
  onUpdateData,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onInsertBelow,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : block.visible ? 1 : 0.65,
  };

  const normalizedType = normalizeBlockTypeKey(block.type);
  const IconComponent = BLOCK_ICONS[normalizedType] || FileText;
  const theme = BLOCK_THEME_COLORS[normalizedType] || {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    pill: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  // Helper to extract a friendly preview snippet
  const getBlockSnippet = () => {
    const rawData = (block.data || {}) as Record<string, unknown>;

    if (normalizedType === 'Hero') {
      const title = resolveStringOrLoc(rawData.title);
      return title || 'Hero Header';
    }
    if (normalizedType === 'Overview') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      return title || 'Project Overview';
    }
    if (normalizedType === 'RichText') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      if (title) return title;
      const content = resolveStringOrLoc(rawData.body || rawData.content);
      return content.replace(/[#*`_~]/g, '').slice(0, 40) || 'Rich Text Section';
    }
    if (normalizedType === 'Media') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      const items = Array.isArray(rawData.items) ? rawData.items : [];
      return title || `${items.length} media item(s)`;
    }
    if (normalizedType === 'Stats') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      const itemsList = Array.isArray(rawData.items)
        ? rawData.items
        : Array.isArray(rawData.cards)
          ? rawData.cards
          : [];
      return title || `${itemsList.length} metric cards`;
    }
    if (normalizedType === 'ProcessSteps') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      const steps = Array.isArray(rawData.steps) ? rawData.steps : [];
      return title || `${steps.length} workflow step(s)`;
    }
    if (normalizedType === 'Decision') {
      const title = resolveStringOrLoc(rawData.sectionTitle);
      const decList = Array.isArray(rawData.decisions)
        ? rawData.decisions
        : Array.isArray(rawData.items)
          ? rawData.items
          : [];
      return title || `${decList.length} design trade-offs`;
    }
    if (normalizedType === 'Callout') {
      const title = resolveStringOrLoc(rawData.sectionTitle || rawData.title);
      if (title) return title;
      const text = resolveStringOrLoc(rawData.text || rawData.content);
      return text.slice(0, 40) || 'Callout Highlight';
    }

    return '';
  };

  const snippet = getBlockSnippet();

  // Render the specific editor component
  const renderEditor = () => {
    const data = block.data || {};

    switch (normalizedType) {
      case 'Hero':
        return (
          <HeroBlockEditor
            data={data as unknown as HeroBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'Overview':
        return (
          <OverviewBlockEditor
            data={data as unknown as OverviewBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'RichText':
        return (
          <RichTextBlockEditor
            data={data as unknown as RichTextBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'Media':
        return (
          <MediaBlockEditor
            data={data as unknown as MediaBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'Stats':
        return (
          <StatsBlockEditor
            data={data as unknown as StatsBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'ProcessSteps':
        return (
          <ProcessStepsBlockEditor
            data={data as unknown as ProcessStepsBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'Decision':
        return (
          <DecisionBlockEditor
            data={data as unknown as DecisionBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      case 'Callout':
        return (
          <CalloutBlockEditor
            data={data as unknown as CalloutBlockData}
            onChange={(newData) => onUpdateData(block.id, newData as unknown as Record<string, unknown>)}
          />
        );
      default:
        return (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Unknown block type: <code className="text-teal-300">{block.type}</code>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isDragging
          ? 'border-teal-500/80 shadow-2xl shadow-teal-500/20 bg-slate-900'
          : isExpanded
            ? 'border-slate-700 bg-slate-900/95 shadow-xl ring-1 ring-slate-700/50'
            : 'border-slate-800/80 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/70'
      }`}
    >
      {/* ─── Sortable Row Header ─── */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5">
        {/* Left: Drag handle, Index, Icon, Type Name & Snippet */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Drag Handle button */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="min-h-[44px] min-w-[32px] sm:min-w-[36px] flex items-center justify-center text-slate-500 hover:text-slate-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Index badge */}
          <span className="text-[11px] font-mono text-slate-500 w-4 text-center font-bold hidden sm:inline">
            {index + 1}
          </span>

          {/* Block Icon */}
          <div
            className={`w-9 h-9 rounded-xl ${theme.bg} ${theme.text} border ${theme.border} flex items-center justify-center shrink-0 shadow-sm`}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          {/* Title & Snippet (Clickable to expand/collapse) */}
          <button
            type="button"
            onClick={() => onToggleExpand(block.id)}
            className="flex-1 text-left min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 cursor-pointer py-1"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${theme.pill}`}>
                {normalizedType}
              </span>
              {!block.visible && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                  Hidden
                </span>
              )}
            </div>

            {snippet && (
              <span className="text-xs text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[320px]">
                {snippet}
              </span>
            )}
          </button>
        </div>

        {/* Right: Action Buttons (Apple HIG 44px touch targets) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Visibility Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleVisibility(block.id)}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              block.visible
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                : 'text-amber-400/80 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/30'
            }`}
            title={block.visible ? 'Hide from public view' : 'Show block'}
          >
            {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Duplicate Block Button */}
          <button
            type="button"
            onClick={() => onDuplicate(block.id)}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-all flex items-center justify-center cursor-pointer"
            title="Duplicate Block"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete Button with inline confirmation */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-rose-950/60 p-1 rounded-xl border border-rose-500/30">
              <button
                type="button"
                onClick={() => onDelete(block.id)}
                className="min-h-[36px] px-2.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="min-h-[36px] px-2 rounded-lg text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center cursor-pointer"
              title="Delete Block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Expand / Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleExpand(block.id)}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isExpanded
                ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
            title={isExpanded ? 'Collapse Editor' : 'Expand Editor'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Expanded Editor Surface ─── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-800/80 bg-slate-900/40 p-4 sm:p-5"
          >
            {renderEditor()}

            {/* Quick action bar at bottom of editor */}
            {onInsertBelow && (
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => onInsertBelow(index + 1)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-teal-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-400" />
                  <span>Insert new block below</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleExpand(block.id)}
                  className="min-h-[40px] px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Done Editing
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
