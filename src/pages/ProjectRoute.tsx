import React, { Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  AlertCircle,
  Home,
} from 'lucide-react';
import { getLegacyProjectBySlug } from '../content/legacy/legacyProjectManifest';
import { getLegacyComponent } from '../content/legacy/legacyProjectRegistry';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MarkdownCaseStudyRenderer } from '../cms/renderers/MarkdownCaseStudyRenderer';
import { PdfDeckCaseStudyRenderer } from '../cms/renderers/PdfDeckCaseStudyRenderer';
import { DynamicCaseStudyRenderer } from '../cms/renderers/DynamicCaseStudyRenderer';
import {
  SAMPLE_MARKDOWN_CASE_STUDY,
  SAMPLE_PDF_DECK_PROJECT,
} from '../content/samples/sampleMarkdownCaseStudy';
import { parseMarkdownFile } from '../cms/parsers/markdownParser';
import type { ContentEntry } from '../cms/types/cms.types';
import { useStore } from '../store/useStore';
import { useProjectBySlug } from '../cms/hooks/useProjects';

export const ProjectRoute: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { isLightMode, setGameState, selectedQuest } = useStore();

  const slug = useMemo(() => {
    if (propSlug) return propSlug;
    if (selectedQuest) return selectedQuest;
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/project\/([^/?#]+)/);
      if (match && match[1]) return match[1];
    }
    return '';
  }, [propSlug, selectedQuest]);

  const normalizedSlug = (slug || '').toLowerCase().trim();

  // Query project by slug from repository / local cache
  const { project: queriedProject, isLoading } = useProjectBySlug(normalizedSlug);

  // 1. Check for sample/demo routes or fallback lookup
  const projectEntry: Partial<ContentEntry> | undefined = useMemo(() => {
    // If fetched from repo / cache
    if (queriedProject) {
      return queriedProject;
    }

    // Check built-in demo routes
    if (
      normalizedSlug === 'ai-design-system-spec' ||
      normalizedSlug === 'markdown-demo' ||
      normalizedSlug === 'markdown-showcase'
    ) {
      const parsed = parseMarkdownFile(SAMPLE_MARKDOWN_CASE_STUDY);
      return {
        ...parsed.metadata,
        render_mode: 'markdown',
      };
    }

    if (
      normalizedSlug === 'pdf-deck-showcase' ||
      normalizedSlug === 'deck-showcase' ||
      normalizedSlug === 'deck-demo'
    ) {
      return SAMPLE_PDF_DECK_PROJECT as unknown as ContentEntry;
    }

    if (
      normalizedSlug === 'builder-demo' ||
      normalizedSlug === 'builder-showcase' ||
      normalizedSlug === 'atomic-builder-demo'
    ) {
      return {
        id: 'builder-demo',
        slug: 'builder-demo',
        title: {
          en: 'Autonomous Agent Dispatch & Token Architecture',
          vi: 'Hệ thống Điều phối Đa Agent & Kiến trúc Token',
        },
        summary: {
          en: 'Distributed AI agent swarm coordination, dynamic policy enforcement, and live visual builder.',
          vi: 'Điều phối đa tác tử AI phân tán, kiểm soát chính sách động và bộ dựng trực quan.',
        },
        category: 'AI & Automation Engineering',
        role: 'Principal Systems Architect',
        render_mode: 'builder',
        status: 'published',
        published_at: new Date().toISOString(),
      };
    }

    // Lookup in default legacy & registered entries
    return getLegacyProjectBySlug(normalizedSlug);
  }, [normalizedSlug, queriedProject]);

  const handleBackToPortfolio = () => {
    setGameState('PROJECT_JOURNEY');
    if (typeof window !== 'undefined') {
      window.history.pushState({ gameState: 'PROJECT_JOURNEY' }, '', '/projects');
    }
  };

  const handleGoHome = () => {
    setGameState('HERO_LANDING');
    if (typeof window !== 'undefined') {
      window.history.pushState({ gameState: 'HERO_LANDING' }, '', '/');
    }
  };

  if (isLoading && !projectEntry) {
    return <LoadingSkeleton />;
  }

  // Determine render mode
  const renderMode = projectEntry?.render_mode || (projectEntry ? 'legacy' : null);

  // ─── Mode 1: Dynamic Atomic Visual Canvas Builder Mode ───
  if (renderMode === 'builder' && projectEntry) {
    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Visual Case Study</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              We encountered an unexpected error while rendering this atomic visual case study.
            </p>
            <button
              onClick={handleBackToPortfolio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-all shadow-lg shadow-teal-600/25"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        }
      >
        <DynamicCaseStudyRenderer
          project={projectEntry as ContentEntry}
          onBack={handleBackToPortfolio}
        />
      </ErrorBoundary>
    );
  }

  // ─── Mode 2: Markdown Case Study Mode ───
  if (renderMode === 'markdown') {
    const rawMarkdownContent =
      (projectEntry as { rawMarkdown?: string })?.rawMarkdown || SAMPLE_MARKDOWN_CASE_STUDY;

    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Markdown Case Study</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Failed to parse or render markdown case study content.
            </p>
            <button
              onClick={handleBackToPortfolio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        }
      >
        <MarkdownCaseStudyRenderer
          content={rawMarkdownContent}
          entry={projectEntry}
          onBack={handleBackToPortfolio}
        />
      </ErrorBoundary>
    );
  }

  // ─── Mode 3: PDF Presentation Deck Showcase Mode ───
  if (renderMode === 'pdf_deck') {
    const pdfData = projectEntry as unknown as {
      pdfUrl?: string;
      slides?: string[];
      totalSlides?: number;
    };

    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Presentation Deck</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              We were unable to load the PDF presentation deck.
            </p>
            <button
              onClick={handleBackToPortfolio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        }
      >
        <PdfDeckCaseStudyRenderer
          entry={projectEntry}
          pdfUrl={pdfData?.pdfUrl}
          slides={pdfData?.slides}
          totalSlides={pdfData?.totalSlides}
          onBack={handleBackToPortfolio}
        />
      </ErrorBoundary>
    );
  }

  // ─── Mode 4: Legacy Component Registry ───
  const legacyKey = projectEntry?.legacy_key || normalizedSlug;
  const LegacyComponent = getLegacyComponent(legacyKey);

  if (LegacyComponent) {
    return (
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Case Study</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              We encountered an unexpected error while rendering this case study.
            </p>
            <button
              onClick={handleBackToPortfolio}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all shadow-lg shadow-orange-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        }
      >
        <Suspense fallback={<LoadingSkeleton />}>
          <LegacyComponent />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // ─── Not Found / 404 State ───
  return (
    <div
      className={`min-h-[85vh] w-full flex items-center justify-center px-4 py-12 ${
        isLightMode ? 'text-slate-800' : 'text-slate-100'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`max-w-md w-full rounded-3xl p-8 text-center border backdrop-blur-xl transition-all shadow-2xl ${
          isLightMode
            ? 'bg-white/80 border-slate-200/80 shadow-slate-300/40'
            : 'bg-[#0f111a]/80 border-slate-800/80 shadow-black/60'
        }`}
      >
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 border transition-colors ${
            isLightMode
              ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-orange-500/10'
              : 'bg-orange-950/40 text-orange-400 border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.15)]'
          }`}
        >
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-orange-500/10 text-orange-500 border border-orange-500/20">
          404 &bull; Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          Project Not Found
        </h1>

        <p
          className={`text-sm mb-8 leading-relaxed ${
            isLightMode ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          The case study <code className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 font-mono text-xs font-semibold">{slug || 'unknown'}</code> could not be found or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleBackToPortfolio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>

          <button
            onClick={handleGoHome}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-medium text-sm border transition-all cursor-pointer ${
              isLightMode
                ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectRoute;
