import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  Tag,
  AlertCircle,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { ContentEntry, ContentBlock, ContentDocument } from '../types/cms.types';
import { getBlockDefinition, createDefaultBlock } from '../blocks/registry';
import { resolveLocalizedString } from '../blocks/types';
import { useStore } from '../../store/useStore';
import { useProjects } from '../hooks/useProjects';
import { DEFAULT_PROJECT_ENTRIES } from '../../content/legacy/legacyProjectManifest';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export interface DynamicCaseStudyRendererProps {
  project?: ContentEntry | Partial<ContentEntry>;
  blocks?: ContentBlock[];
  mode?: 'published' | 'draft';
  lang?: 'en' | 'vi';
  isLivePreview?: boolean;
  onBack?: () => void;
}

/**
 * High-Fidelity Atomic Visual Case Study Renderer (Sprint 3)
 * - Renders dynamic content blocks from ContentDocument or live blocks array
 * - Top sticky header with Apple HIG margins and reading progress bar
 * - Seamless block dispatching via BlockRegistry singleton
 * - Next/Previous project navigation bar
 */
export const DynamicCaseStudyRenderer: React.FC<DynamicCaseStudyRendererProps> = ({
  project = {},
  blocks: explicitBlocks,
  mode = 'published',
  lang: explicitLang,
  isLivePreview = false,
  onBack,
}) => {
  const { isLightMode, language: storeLanguage, setGameState, handleQuestSelect } = useStore();
  const { projects: allProjects } = useProjects();

  const activeLang = explicitLang || storeLanguage;

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Determine active document
  const activeDocument: ContentDocument = useMemo(() => {
    if (mode === 'draft') {
      return (
        project.draft_document ||
        project.published_document || {
          schemaVersion: 1,
          blocks: [],
        }
      );
    }
    return (
      project.published_document ||
      project.draft_document || {
        schemaVersion: 1,
        blocks: [],
      }
    );
  }, [project, mode]);

  // Extract visible blocks (or fallback to sample blocks if document is empty)
  const blocks: ContentBlock[] = useMemo(() => {
    if (explicitBlocks && explicitBlocks.length > 0) {
      return explicitBlocks.filter((b) => b.visible !== false);
    }

    const rawBlocks = activeDocument?.blocks || [];
    const visible = rawBlocks.filter((b) => b.visible !== false);

    if (visible.length > 0) {
      return visible;
    }

    // Fallback: If no blocks exist and not in live preview mode, generate demo blocks
    if (isLivePreview && explicitBlocks && explicitBlocks.length === 0) {
      return [];
    }

    const titleEn = typeof project.title === 'string' ? project.title : project.title?.en || 'Case Study';
    const titleVi = typeof project.title === 'string' ? project.title : project.title?.vi || 'Dự án';
    const summaryEn = typeof project.summary === 'string' ? project.summary : project.summary?.en || '';
    const summaryVi = typeof project.summary === 'string' ? project.summary : project.summary?.vi || '';

    const heroBlock = createDefaultBlock('hero');
    heroBlock.data = {
      ...heroBlock.data,
      title: { en: titleEn, vi: titleVi },
      subtitle: { en: summaryEn, vi: summaryVi },
      category: project.category || 'Product Design',
      role: project.role || 'Lead Product Designer',
      coverImage: project.seo?.og_image || '',
    };

    const overviewBlock = createDefaultBlock('overview');
    overviewBlock.data = {
      ...overviewBlock.data,
      role: { en: project.role || 'Lead Architect', vi: project.role || 'Kiến trúc sư Trưởng' },
    };

    const richTextBlock = createDefaultBlock('rich_text');
    const statsBlock = createDefaultBlock('stats');
    const processBlock = createDefaultBlock('process_steps');
    const decisionBlock = createDefaultBlock('decision');
    const calloutBlock = createDefaultBlock('callout');

    return [heroBlock, overviewBlock, richTextBlock, statsBlock, processBlock, decisionBlock, calloutBlock];
  }, [explicitBlocks, activeDocument, isLivePreview, project]);

  // Scroll Progress Listener
  useEffect(() => {
    if (isLivePreview) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLivePreview]);

  const handleBackToPortfolio = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    setGameState('PROJECT_JOURNEY');
    if (typeof window !== 'undefined') {
      window.history.pushState({ gameState: 'PROJECT_JOURNEY' }, '', '/projects');
    }
  }, [onBack, setGameState]);

  const handleShareLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  }, []);

  // Compute Next / Previous Project for bottom navigation
  const projectList = allProjects.length > 0 ? allProjects : DEFAULT_PROJECT_ENTRIES;
  const currentIndex = projectList.findIndex((p) => p.slug === project.slug || p.id === project.id);
  const prevProject = currentIndex > 0 ? projectList[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < projectList.length - 1 ? projectList[currentIndex + 1] : null;

  const titleText = resolveLocalizedString(project.title, activeLang) || 'Case Study';
  const categoryText = project.category || 'Product Design';
  const roleText = project.role || '';

  return (
    <div
      className={`w-full transition-colors duration-300 ${
        isLivePreview ? 'pb-12' : 'min-h-screen pb-28'
      } ${
        isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0f19] text-slate-100'
      }`}
    >
      {/* ─── Reading Progress Bar (hidden in live canvas) ─── */}
      {!isLivePreview && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800/40 z-50">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 transition-all duration-150 shadow-[0_0_10px_rgba(13,148,136,0.5)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* ─── Sticky Header (Apple HIG Margins & Glassmorphism, hidden in live canvas) ─── */}
      {!isLivePreview && (
        <header
          className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors ${
            isLightMode
              ? 'bg-white/80 border-slate-200 shadow-sm'
              : 'bg-[#0b0f19]/80 border-slate-800/80 shadow-black/40'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between">
            <button
              onClick={handleBackToPortfolio}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isLightMode
                  ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{activeLang === 'vi' ? 'Dự án' : 'Back to Projects'}</span>
            </button>

            {/* Center Title Pill */}
            <div className="hidden md:flex items-center gap-2 max-w-md truncate">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Tag className="w-3 h-3" />
                {categoryText}
              </span>
              <span className="font-['Space_Grotesk',sans-serif] font-bold text-sm truncate">
                {titleText}
              </span>
              {roleText && (
                <span className="text-xs text-slate-400 truncate hidden lg:inline">
                  &bull; {roleText}
                </span>
              )}
            </div>

            {/* Right Toolbar */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                  isCopiedLink
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : isLightMode
                      ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                      : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                }`}
                title="Copy share link"
              >
                {isCopiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeLang === 'vi' ? 'Đã sao chép' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{activeLang === 'vi' ? 'Chia sẻ' : 'Share'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ─── Atomic Blocks Stream ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-4">
        {blocks.map((block, index) => {
          // Normalize block type (e.g. 'Hero' -> 'hero', 'heading' -> 'rich_text')
          const normalizedType = block.type.toLowerCase().trim();
          let blockDef = getBlockDefinition(normalizedType);

          // Handle markdown-extracted legacy block types
          if (!blockDef) {
            if (['heading', 'quote', 'code', 'table', 'list', 'richtext'].includes(normalizedType)) {
              blockDef = getBlockDefinition('rich_text');
            }
          }

          if (!blockDef) {
            return (
              <div
                key={block.id || index}
                className="my-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono"
              >
                Unknown block type: <strong>{block.type}</strong>
              </div>
            );
          }

          const RendererComponent = blockDef.Renderer;

          return (
            <ErrorBoundary
              key={block.id || index}
              fallback={
                <div className="my-6 p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm">
                    Error rendering block <strong>{block.type}</strong> ({block.id})
                  </span>
                </div>
              }
            >
              <RendererComponent data={block.data} />
            </ErrorBoundary>
          );
        })}
        {blocks.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold font-display">
              {activeLang === 'vi' ? 'Chưa có khối nội dung nào' : 'No Section Blocks Added'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeLang === 'vi'
                ? 'Nhấn "+ Thêm Khối Nội Dung" ở thanh bên trái để bắt đầu thiết kế case study.'
                : 'Click "+ Add Section Block" in the left panel to begin building your case study layout.'}
            </p>
          </div>
        )}
      </main>

      {/* ─── Next / Previous Navigation Footer (hidden in live canvas) ─── */}
      {!isLivePreview && (
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 mt-16 pt-10 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {prevProject ? (
              <button
                onClick={() => {
                  handleQuestSelect(prevProject.slug);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/project/${prevProject.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`p-6 rounded-3xl border text-left transition-all duration-300 group cursor-pointer ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-500/40 shadow-sm'
                    : 'bg-[#0f172a]/70 hover:bg-[#0f172a] border-slate-800 hover:border-teal-500/40 shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-hover:text-teal-400 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>{activeLang === 'vi' ? 'Dự án trước' : 'Previous Project'}</span>
                </div>
                <div className="font-['Space_Grotesk',sans-serif] font-bold text-base sm:text-lg line-clamp-1">
                  {resolveLocalizedString(prevProject.title, activeLang)}
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextProject && (
              <button
                onClick={() => {
                  handleQuestSelect(nextProject.slug);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/project/${nextProject.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`p-6 rounded-3xl border text-right transition-all duration-300 group cursor-pointer ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-500/40 shadow-sm'
                    : 'bg-[#0f172a]/70 hover:bg-[#0f172a] border-slate-800 hover:border-teal-500/40 shadow-md'
                }`}
              >
                <div className="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-hover:text-teal-400 transition-colors">
                  <span>{activeLang === 'vi' ? 'Dự án kế tiếp' : 'Next Project'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="font-['Space_Grotesk',sans-serif] font-bold text-base sm:text-lg line-clamp-1">
                  {resolveLocalizedString(nextProject.title, activeLang)}
                </div>
              </button>
            )}
          </div>

          {/* Back to Top and All Projects buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBackToPortfolio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-teal-600/25 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{activeLang === 'vi' ? 'Xem tất cả Dự án' : 'Back to All Projects'}</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                isLightMode
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span>{activeLang === 'vi' ? 'Lên đầu trang' : 'Back to Top'}</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default DynamicCaseStudyRenderer;
