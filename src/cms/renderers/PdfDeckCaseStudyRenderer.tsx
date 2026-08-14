import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Layers,
  ExternalLink,
  Tag,
  Calendar,
} from 'lucide-react';
import type { ContentEntry } from '../types/cms.types';
import { useStore } from '../../store/useStore';

export interface PdfDeckCaseStudyRendererProps {
  entry?: Partial<ContentEntry> & {
    pdfUrl?: string;
    totalSlides?: number;
    slides?: string[];
    coverImage?: string;
    date?: string;
  };
  pdfUrl?: string;
  slides?: string[];
  totalSlides?: number;
  onBack?: () => void;
}

/**
 * Interactive PDF Presentation Deck Showcase Component
 * - Dual view modes: Interactive High-Res Slide Deck & Native PDF Embed
 * - Keyboard navigation (Arrows, Space, Home, End)
 * - Mobile Touch & Swipe gesture support
 * - Fullscreen toggle with Fullscreen API
 * - Zoom & Pan controls
 * - Google Analytics 4 file_download event tracking
 * - Apple HIG Margins & Glassmorphism Aesthetics
 */
export const PdfDeckCaseStudyRenderer: React.FC<PdfDeckCaseStudyRendererProps> = ({
  entry,
  pdfUrl: propPdfUrl,
  slides: propSlides,
  totalSlides: propTotalSlides,
  onBack,
}) => {
  const { isLightMode, setGameState } = useStore();
  const deckContainerRef = useRef<HTMLDivElement>(null);

  // Resolved metadata
  const title =
    typeof entry?.title === 'string'
      ? entry.title
      : entry?.title?.vi || entry?.title?.en || 'Interactive Presentation Deck';
  const summary =
    typeof entry?.summary === 'string'
      ? entry.summary
      : entry?.summary?.vi || entry?.summary?.en || '';
  const category = entry?.category || 'Presentation Deck';
  const role = entry?.role || 'Principal Product Designer';
  const date = entry?.date || (entry?.published_at ? new Date(entry.published_at).getFullYear().toString() : '2026');

  // Resolved PDF URL & Slides
  const effectivePdfUrl = propPdfUrl || entry?.pdfUrl || '/assets/decks/case-study-deck.pdf';
  const effectiveSlides = propSlides || entry?.slides || [];
  const effectiveTotalSlides =
    propTotalSlides ||
    entry?.totalSlides ||
    (effectiveSlides.length > 0 ? effectiveSlides.length : 12);

  // View & Slide State
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'slides' | 'embed'>('slides');

  // Touch Swipe coordinates
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Handle Back
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

  // Handle PDF Download with GA4 Tracking
  const handleDownloadPdf = useCallback(() => {
    const fileName = effectivePdfUrl.split('/').pop() || `${title.replace(/\s+/g, '-').toLowerCase()}-deck.pdf`;

    // Trigger GA4 event if gtag is available
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'file_download', {
        file_name: fileName,
        file_extension: 'pdf',
        link_url: effectivePdfUrl,
        project_title: title,
      });
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = effectivePdfUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [effectivePdfUrl, title]);

  // Slide navigation handlers
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < effectiveTotalSlides ? prev + 1 : prev));
  }, [effectiveTotalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToSlide = useCallback(
    (slideNum: number) => {
      if (slideNum >= 1 && slideNum <= effectiveTotalSlides) {
        setCurrentSlide(slideNum);
      }
    },
    [effectiveTotalSlides]
  );

  // Fullscreen API toggle
  const toggleFullscreen = useCallback(() => {
    if (!deckContainerRef.current) return;

    if (!document.fullscreenElement) {
      deckContainerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  }, []);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(effectiveTotalSlides);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, goToSlide, toggleFullscreen, effectiveTotalSlides]);

  // Touch Swipe Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe with minimum threshold and angle limit
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Helper to render slide content
  const renderSlideContent = (slideIndex: number) => {
    const slideImage = effectiveSlides[slideIndex - 1];

    if (slideImage) {
      return (
        <img
          src={slideImage}
          alt={`Slide ${slideIndex}`}
          className="w-full h-full object-contain select-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
          draggable={false}
        />
      );
    }

    // Default High-Fidelity SVG Presentation Slide Template
    return (
      <div
        className={`w-full h-full p-6 sm:p-12 flex flex-col justify-between select-none relative overflow-hidden transition-all ${
          isLightMode
            ? 'bg-gradient-to-br from-white via-slate-50 to-orange-50/30 text-slate-900'
            : 'bg-gradient-to-br from-[#0e1424] via-[#090d16] to-[#141a2e] text-slate-100'
        }`}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Ambient Decorative Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-orange-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
              {category}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
              {title}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-md border border-orange-500/20">
            Slide {slideIndex.toString().padStart(2, '0')} / {effectiveTotalSlides.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Slide Body Content */}
        <div className="relative z-10 my-auto py-6 sm:py-10 max-w-3xl">
          {slideIndex === 1 ? (
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
                Executive Overview &amp; Strategy
              </span>
              <h2 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {title}
              </h2>
              <p className="font-['DM_Sans',sans-serif] text-base sm:text-xl text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">
                {summary || 'Interactive design presentation deck showcasing research, wireframing, component architecture, and design token integration.'}
              </p>
              <div className="pt-4 flex items-center gap-4 text-xs sm:text-sm text-slate-400">
                <span className="font-semibold text-slate-200">{role}</span>
                <span>&bull;</span>
                <span>{date}</span>
              </div>
            </div>
          ) : slideIndex === 2 ? (
            <div className="space-y-4">
              <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                Section 01 &bull; Problem Statement
              </span>
              <h3 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight">
                Core Challenges &amp; Strategic Opportunity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                  <h4 className="font-bold text-sm text-orange-400 mb-1">Friction Points</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Legacy workflows caused fragmentation, prolonged review cycles, and reduced design-to-code velocity.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                  <h4 className="font-bold text-sm text-emerald-400 mb-1">Target Solution</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Modular atomic design system with automated token synchronization and zero-overhead handoff.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                Slide {slideIndex} &bull; Architecture &amp; Delivery
              </span>
              <h3 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight">
                Design Decisions &amp; Execution Framework
              </h3>
              <p className="font-['DM_Sans',sans-serif] text-sm sm:text-base text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">
                Detailed wireframe blueprints, token distribution pipelines, and comprehensive usability validation ensuring Apple HIG fidelity.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
                <span>View Full Deck in Embedded PDF Mode for complete vector assets</span>
                <span className="text-orange-400 font-bold">&rarr;</span>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs text-slate-500 font-mono">
          <span>Son Thao &bull; Product Design Presentation</span>
          <span>Confidential &bull; All Rights Reserved</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 pb-20 ${
        isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* ─── Top Header (Apple HIG Margins) ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors bg-opacity-80 border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between">
          <button
            onClick={handleBackToPortfolio}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isLightMode
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          {/* Download CTA with GA4 tracking */}
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải bản PDF gốc /</span>
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* ─── Hero Overview ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Tag className="w-3 h-3" />
                {category}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-700/40">
                <Layers className="w-3 h-3" />
                {effectiveTotalSlides} Slides
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-700/40">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
            </div>

            <h1 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
              {title}
            </h1>

            {summary && (
              <p
                className={`font-['DM_Sans',sans-serif] text-sm sm:text-lg leading-relaxed ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {summary}
              </p>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('slides')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'slides'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Slides</span>
            </button>
            <button
              onClick={() => setViewMode('embed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'embed'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Native PDF Embed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Deck Viewer Container ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-2">
        <div
          ref={deckContainerRef}
          className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-black border-none' : ''
          } ${
            isLightMode
              ? 'bg-white border-slate-200/90 shadow-slate-300/40'
              : 'bg-[#0f1422] border-slate-800/80 shadow-black/80'
          }`}
        >
          {viewMode === 'slides' ? (
            <div className="flex flex-col">
              {/* Slide Stage with Touch and Swipe */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-video w-full flex items-center justify-center overflow-hidden bg-black/40 cursor-grab active:cursor-grabbing select-none"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    {renderSlideContent(currentSlide)}
                  </motion.div>
                </AnimatePresence>

                {/* Left / Right Click Nav Overlays */}
                <button
                  onClick={goToPrevSlide}
                  disabled={currentSlide === 1}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-md border transition-all z-20 ${
                    currentSlide === 1
                      ? 'opacity-0 pointer-events-none'
                      : 'bg-black/60 hover:bg-black/90 border-white/20 text-white shadow-xl active:scale-95'
                  }`}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNextSlide}
                  disabled={currentSlide === effectiveTotalSlides}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-md border transition-all z-20 ${
                    currentSlide === effectiveTotalSlides
                      ? 'opacity-0 pointer-events-none'
                      : 'bg-black/60 hover:bg-black/90 border-white/20 text-white shadow-xl active:scale-95'
                  }`}
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-200">
                {/* Slide Counter */}
                <div className="flex items-center gap-3">
                  <span className="font-['Space_Grotesk',sans-serif] text-sm font-bold text-orange-400">
                    Trang {currentSlide} / {effectiveTotalSlides}
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:inline font-mono">
                    (Use &larr; &rarr; or swipe to flip)
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevSlide}
                    disabled={currentSlide === 1}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Previous slide (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Thumbnail / Dot indicator mini bar */}
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-800">
                    {Array.from({ length: effectiveTotalSlides }).map((_, idx) => {
                      const slideNum = idx + 1;
                      const isCurrent = slideNum === currentSlide;
                      return (
                        <button
                          key={slideNum}
                          onClick={() => goToSlide(slideNum)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            isCurrent
                              ? 'w-6 bg-orange-500'
                              : 'w-2 bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Jump to slide ${slideNum}`}
                        />
                      );
                    })}
                  </div>

                  <button
                    onClick={goToNextSlide}
                    disabled={currentSlide === effectiveTotalSlides}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Next slide (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Zoom & Fullscreen Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4 text-slate-300" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4 text-slate-300" />
                  </button>
                  {zoomLevel !== 1 && (
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                      title="Reset zoom"
                    >
                      <RotateCcw className="w-4 h-4 text-orange-400" />
                    </button>
                  )}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors ml-1"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Maximize2 className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Native PDF Embed View */
            <div className="relative w-full h-[75vh] bg-slate-950 flex flex-col">
              <iframe
                src={`${effectivePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={title}
                className="w-full h-full border-none"
              />
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">Embedding source: {effectivePdfUrl}</span>
                <a
                  href={effectivePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-400 hover:underline font-semibold"
                >
                  <span>Open PDF in new tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer Action Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleBackToPortfolio}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/25 cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Tải bản PDF gốc / Download PDF</span>
        </button>
      </div>
    </div>
  );
};

export default PdfDeckCaseStudyRenderer;
