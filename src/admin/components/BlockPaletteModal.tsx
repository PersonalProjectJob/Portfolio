import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
} from 'lucide-react';
import type { BlockType } from '../../cms/blocks/types';
import { getAllBlockDefinitions } from '../../cms/blocks/registry';
import { resolveLocalizedString } from '../../cms/blocks/types';

export interface BlockPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  language?: 'en' | 'vi';
}

const CATEGORY_TABS = [
  { id: 'all', label: { en: 'All Blocks', vi: 'Tất cả' } },
  { id: 'header', label: { en: 'Headers', vi: 'Đầu trang' } },
  { id: 'content', label: { en: 'Narrative & Text', vi: 'Nội dung & Văn bản' } },
  { id: 'media', label: { en: 'Media & Gallery', vi: 'Hình ảnh' } },
  { id: 'data', label: { en: 'Data & Metrics', vi: 'Chỉ số & Đo lường' } },
  { id: 'workflow', label: { en: 'Process & Logic', vi: 'Quy trình & Đánh đổi' } },
] as const;

export const BlockPaletteModal: React.FC<BlockPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  language = 'en',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allDefinitions = useMemo(() => getAllBlockDefinitions(), []);

  const filteredDefinitions = useMemo(() => {
    return allDefinitions.filter((def) => {
      // Category filter
      if (selectedCategory !== 'all' && def.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const labelEn = def.label.en.toLowerCase();
        const labelVi = def.label.vi.toLowerCase();
        const descEn = def.description.en.toLowerCase();
        const descVi = def.description.vi.toLowerCase();
        const typeStr = def.type.toLowerCase();
        return (
          labelEn.includes(q) ||
          labelVi.includes(q) ||
          descEn.includes(q) ||
          descVi.includes(q) ||
          typeStr.includes(q)
        );
      }
      return true;
    });
  }, [allDefinitions, selectedCategory, searchQuery]);

  const handleSelect = (type: string) => {
    onSelectBlock(type as BlockType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-900/40 border border-teal-500/30 text-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">
                    {language === 'vi' ? 'Thêm Khối Nội Dung Mới' : 'Add Section Block'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {language === 'vi'
                      ? 'Chọn mẫu khối nguyên tử để thêm vào hồ sơ năng lực của bạn.'
                      : 'Choose an atomic block template to inject into your case study stream.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-3 mb-4">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'vi'
                      ? 'Tìm kiếm theo tên khối, mô tả (Hero, Metrics, Quy trình, Media...)'
                      : 'Search block templates (Hero, Overview, Media, Stats, Process...)'
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.id;
                  const label = resolveLocalizedString(tab.label, language);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Block Cards */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredDefinitions.map((def) => {
                const Icon = def.icon;
                const title = resolveLocalizedString(def.label, language);
                const desc = resolveLocalizedString(def.description, language);

                return (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => handleSelect(def.type)}
                    className="p-4 rounded-2xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-900 hover:border-teal-500/50 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-teal-950/40 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0 transition-colors shadow-inner">
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white font-display group-hover:text-teal-300 transition-colors truncate">
                          {title}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                          {def.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredDefinitions.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                  {language === 'vi' ? 'Không tìm thấy mẫu khối phù hợp.' : 'No matching block templates found.'}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BlockPaletteModal;
