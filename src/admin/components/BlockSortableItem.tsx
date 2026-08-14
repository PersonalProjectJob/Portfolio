import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
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
} from 'lucide-react';
import type { ContentBlock } from '../../cms/types/cms.types';
import { getBlockDefinition } from '../../cms/blocks/registry';
import { resolveLocalizedString } from '../../cms/blocks/types';

// Import all 8 block editors
import { HeroBlockEditor } from '../../cms/blocks/editors/HeroBlockEditor';
import { OverviewBlockEditor } from '../../cms/blocks/editors/OverviewBlockEditor';
import { RichTextBlockEditor } from '../../cms/blocks/editors/RichTextBlockEditor';
import { MediaBlockEditor } from '../../cms/blocks/editors/MediaBlockEditor';
import { StatsBlockEditor } from '../../cms/blocks/editors/StatsBlockEditor';
import { ProcessStepsBlockEditor } from '../../cms/blocks/editors/ProcessStepsBlockEditor';
import { DecisionBlockEditor } from '../../cms/blocks/editors/DecisionBlockEditor';
import { CalloutBlockEditor } from '../../cms/blocks/editors/CalloutBlockEditor';

export interface BlockSortableItemProps {
  block: ContentBlock;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onUpdateData: (id: string, newData: Record<string, unknown>) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  language?: 'en' | 'vi';
}

export const BlockSortableItem: React.FC<BlockSortableItemProps> = ({
  block,
  index,
  isExpanded,
  onToggleExpand,
  onUpdateData,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  language = 'en',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const blockDef = getBlockDefinition(block.type);
  const Icon = blockDef?.icon || Sparkles;
  const label = blockDef ? resolveLocalizedString(blockDef.label, language) : block.type;

  // Render specific editor by type
  const renderEditor = () => {
    const normType = block.type.toLowerCase().trim();
    const currentData = (block.data || {}) as any;

    const handleChange = (newData: any) => {
      onUpdateData(block.id, newData);
    };

    switch (normType) {
      case 'hero':
        return <HeroBlockEditor data={currentData} onChange={handleChange} />;
      case 'overview':
        return <OverviewBlockEditor data={currentData} onChange={handleChange} />;
      case 'rich_text':
      case 'richtext':
        return <RichTextBlockEditor data={currentData} onChange={handleChange} />;
      case 'media':
        return <MediaBlockEditor data={currentData} onChange={handleChange} />;
      case 'stats':
        return <StatsBlockEditor data={currentData} onChange={handleChange} />;
      case 'process_steps':
      case 'processsteps':
        return <ProcessStepsBlockEditor data={currentData} onChange={handleChange} />;
      case 'decision':
        return <DecisionBlockEditor data={currentData} onChange={handleChange} />;
      case 'callout':
        return <CalloutBlockEditor data={currentData} onChange={handleChange} />;
      default:
        return (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-mono">
            Generic Data Editor for: <strong>{block.type}</strong>
            <pre className="mt-2 text-[11px] max-h-48 overflow-auto text-teal-300">
              {JSON.stringify(block.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all duration-200 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-lg ${
        isDragging
          ? 'border-teal-500 shadow-2xl shadow-teal-950/80 ring-2 ring-teal-500/40'
          : block.visible === false
            ? 'border-slate-800/40 opacity-60'
            : isExpanded
              ? 'border-teal-500/40 shadow-xl shadow-black/40'
              : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Accordion Bar Header */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 select-none bg-slate-900/90">
        
        {/* Left: Drag Handle & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Block Type Icon */}
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>

          {/* Title and Index */}
          <button
            type="button"
            onClick={() => onToggleExpand(block.id)}
            className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer"
          >
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-white truncate font-display">
              {label}
            </span>
            {block.visible === false && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Hidden
              </span>
            )}
          </button>
        </div>

        {/* Right: Quick Actions (Visibility, Duplicate, Delete, Expand) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle Visibility */}
          <button
            type="button"
            onClick={() => onToggleVisibility(block.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              block.visible === false
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={block.visible === false ? 'Show Block' : 'Hide Block'}
          >
            {block.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Duplicate Block */}
          <button
            type="button"
            onClick={() => onDuplicate(block.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Duplicate Block"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Block */}
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete Block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Chevron */}
          <button
            type="button"
            onClick={() => onToggleExpand(block.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-teal-400" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body Editor */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-slate-800/80 bg-slate-950/70 p-4"
          >
            {renderEditor()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlockSortableItem;
