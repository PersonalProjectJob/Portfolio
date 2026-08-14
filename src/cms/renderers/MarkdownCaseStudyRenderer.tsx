import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  User,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
  Quote as QuoteIcon,
  Share2,
  BookOpen,
  List,
} from 'lucide-react';
import type { ContentEntry } from '../types/cms.types';
import { parseMarkdownFile, extractHeadings } from '../parsers/markdownParser';
import { useStore } from '../../store/useStore';

export interface MarkdownCaseStudyRendererProps {
  content?: string;
  entry?: Partial<ContentEntry> & {
    coverImage?: string;
    date?: string;
    tags?: string[];
  };
  onBack?: () => void;
}

/**
 * High-Fidelity Markdown Case Study Renderer
 * - Spaces typography: Space Grotesk headings, DM Sans prose
 * - Interactive Lightbox for zoomable images
 * - Fenced code blocks with copy-to-clipboard button
 * - Styled glassmorphism blockquotes and tables
 * - Table of Contents (TOC) with scroll tracking
 * - Reading progress bar & Vietnamese widow control
 */
export const MarkdownCaseStudyRenderer: React.FC<MarkdownCaseStudyRendererProps> = ({
  content = '',
  entry: initialEntry,
  onBack,
}) => {
  const { isLightMode, setGameState } = useStore();

  // Parse markdown content & frontmatter
  const parsedData = useMemo(() => {
    return parseMarkdownFile(content);
  }, [content]);

  // Combine metadata from entry prop and parsed frontmatter
  const entry = useMemo(() => {
    const meta = { ...parsedData.metadata, ...initialEntry };
    return meta;
  }, [parsedData, initialEntry]);

  const rawMarkdown = parsedData.rawMarkdown || content;
  const headings = useMemo(() => extractHeadings(rawMarkdown), [rawMarkdown]);

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Active Heading for TOC
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Handle Scroll tracking for TOC & Progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));

      // Find visible heading
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveHeadingId(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

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

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsTocOpen(false);
    }
  }, []);

  // Title and summary resolution
  const titleText =
    typeof entry.title === 'string'
      ? entry.title
      : entry.title?.vi || entry.title?.en || 'Case Study';
  const summaryText =
    typeof entry.summary === 'string'
      ? entry.summary
      : entry.summary?.vi || entry.summary?.en || '';
  const categoryText = entry.category || 'Product Design';
  const roleText = entry.role || 'Lead Product Designer';
  const dateText = entry.date || (entry.published_at ? new Date(entry.published_at).getFullYear().toString() : '2026');
  const coverImage = entry.coverImage || entry.seo?.og_image;
  const tags = entry.tags || (entry.seo?.keywords as string[]) || [];
  const readingTime = parsedData.readingTimeMinutes || 4;

  // Custom Code Block component with Copy Button
  const CodeBlock = ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    if (inline) {
      return (
        <code
          className={`px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-xs font-semibold ${
            isLightMode
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-orange-950/40 text-orange-300 border border-orange-500/30'
          }`}
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div
        className={`relative my-6 rounded-2xl overflow-hidden border shadow-xl transition-all ${
          isLightMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#090d16] border-slate-800/80 text-slate-200 shadow-black/50'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
          <span className="uppercase tracking-wider font-medium text-orange-400">
            {language || 'Code'}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs cursor-pointer active:scale-95"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed scrollbar-thin">
          <pre className="!m-0 !p-0">
            <code>{children}</code>
          </pre>
        </div>
      </div>
    );
  };

  // Custom Image component with click-to-zoom
  const MarkdownImage = ({
    src,
    alt,
    title: imgTitle,
  }: {
    src?: string;
    alt?: string;
    title?: string;
  }) => {
    if (!src) return null;
    const caption = imgTitle || alt;

    return (
      <figure className="my-8 group">
        <div
          onClick={() => {
            setLightboxImage({ src, alt: caption });
            setZoomLevel(1);
          }}
          className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border cursor-zoom-in transition-all duration-300 hover:shadow-2xl ${
            isLightMode
              ? 'bg-slate-100 border-slate-200/80 hover:border-orange-500/40 shadow-slate-200'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-orange-500/40 shadow-black/40'
          }`}
        >
          <img
            src={src}
            alt={alt || 'Case study illustration'}
            loading="lazy"
            className="w-full h-auto object-cover max-h-[600px] transition-transform duration-500 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
            <span className="text-xs text-white/90 font-medium line-clamp-1">
              {caption}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white/90 text-xs">
              <Maximize2 className="w-3.5 h-3.5" /> Zoom
            </span>
          </div>
        </div>
        {caption && (
          <figcaption
            className={`mt-2.5 text-center text-xs sm:text-sm italic ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  };

  // Custom Table component
  const MarkdownTable = ({ children }: { children?: React.ReactNode }) => (
    <div className="my-8 w-full overflow-x-auto rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm">{children}</table>
    </div>
  );

  // Markdown Custom Components Map
  const markdownComponents: Components = {
    h1: ({ children }) => {
      const headingText = String(children);
      const id = extractHeadings(headingText)[0]?.id || '';
      return (
        <h1
          id={id}
          className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-10 mb-4 text-balance scroll-mt-24 pb-2 border-b border-orange-500/20 flex items-center group"
        >
          <span className="flex-1">{children}</span>
          {id && (
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(id);
              }}
              className="opacity-0 group-hover:opacity-100 text-orange-500 text-lg sm:text-xl ml-2 transition-opacity"
              aria-label="Anchor link"
            >
              #
            </a>
          )}
        </h1>
      );
    },
    h2: ({ children }) => {
      const headingText = String(children);
      const id = extractHeadings(headingText)[0]?.id || '';
      return (
        <h2
          id={id}
          className="font-['Space_Grotesk',sans-serif] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mt-10 mb-4 scroll-mt-24 pl-4 border-l-4 border-orange-500/90 flex items-center group"
        >
          <span className="flex-1">{children}</span>
          {id && (
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(id);
              }}
              className="opacity-0 group-hover:opacity-100 text-orange-500 text-base sm:text-lg ml-2 transition-opacity"
              aria-label="Anchor link"
            >
              #
            </a>
          )}
        </h2>
      );
    },
    h3: ({ children }) => {
      const headingText = String(children);
      const id = extractHeadings(headingText)[0]?.id || '';
      return (
        <h3
          id={id}
          className="font-['Space_Grotesk',sans-serif] text-lg sm:text-xl md:text-2xl font-bold mt-8 mb-3 scroll-mt-24 text-orange-400 dark:text-orange-400 text-orange-600"
        >
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p
        className={`font-['DM_Sans',sans-serif] text-base sm:text-lg leading-relaxed sm:leading-8 my-4 text-pretty ${
          isLightMode ? 'text-slate-700' : 'text-slate-300'
        }`}
      >
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul
        className={`font-['DM_Sans',sans-serif] list-disc list-outside pl-6 my-4 space-y-2 text-base sm:text-lg leading-relaxed ${
          isLightMode ? 'text-slate-700 marker:text-orange-600' : 'text-slate-300 marker:text-orange-400'
        }`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`font-['DM_Sans',sans-serif] list-decimal list-outside pl-6 my-4 space-y-2 text-base sm:text-lg leading-relaxed ${
          isLightMode ? 'text-slate-700 marker:text-orange-600' : 'text-slate-300 marker:text-orange-400'
        }`}
      >
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <div
        className={`relative my-8 p-6 rounded-2xl sm:rounded-3xl border backdrop-blur-xl transition-all shadow-lg ${
          isLightMode
            ? 'bg-orange-50/70 border-orange-200 text-slate-800 shadow-orange-500/5'
            : 'bg-gradient-to-br from-orange-950/20 to-slate-900/60 border-orange-500/30 text-slate-200 shadow-[0_0_30px_rgba(249,115,22,0.08)]'
        }`}
      >
        <div className="flex items-start gap-3">
          <QuoteIcon className="w-6 h-6 text-orange-500 shrink-0 mt-1 opacity-80" />
          <div className="font-['DM_Sans',sans-serif] italic text-base sm:text-lg leading-relaxed text-pretty">
            {children}
          </div>
        </div>
      </div>
    ),
    table: MarkdownTable,
    thead: ({ children }) => (
      <thead className={isLightMode ? 'bg-slate-200/80 text-slate-800' : 'bg-slate-800/80 text-slate-200'}>
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className={`divide-y ${isLightMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className={`transition-colors ${isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-slate-800/40'}`}>
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider font-mono">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-sm">{children}</td>,
    code: CodeBlock as any,
    img: MarkdownImage as any,
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http') || href?.startsWith('//');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-0.5 text-orange-500 hover:text-orange-400 underline underline-offset-4 decoration-orange-500/50 hover:decoration-orange-400 font-medium transition-colors"
        >
          <span>{children}</span>
          {isExternal && <ExternalLink className="w-3 h-3 ml-0.5 inline opacity-70" />}
        </a>
      );
    },
    hr: () => (
      <div className="my-10 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </div>
    ),
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 pb-24 ${
        isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0f19] text-slate-100'
      }`}
    >
      {/* ─── Reading Progress Bar ─── */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800/40 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ─── Top Navigation Bar (Apple HIG Margins) ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors bg-opacity-80 border-slate-800/60">
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
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-2">
            {headings.length > 0 && (
              <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  isLightMode
                    ? 'border-slate-300 bg-white text-slate-700'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Mục lục</span>
              </button>
            )}

            <button
              onClick={handleShareLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
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
                  <span>Copied Link</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-14 pb-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Tag className="w-3 h-3" />
              {categoryText}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-700/40">
              <Clock className="w-3 h-3" />
              {readingTime} min read
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-700/40">
              <Calendar className="w-3 h-3" />
              {dateText}
            </span>
          </div>

          <h1 className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            {titleText}
          </h1>

          {summaryText && (
            <p
              className={`font-['DM_Sans',sans-serif] text-lg sm:text-xl leading-relaxed mb-6 font-normal text-pretty ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {summaryText}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/40 text-xs sm:text-sm text-slate-400">
            {roleText && (
              <div className="inline-flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span>Role: <strong className="text-slate-200 dark:text-slate-200 text-slate-800">{roleText}</strong></span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/40 text-xs"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl relative"
          >
            <img
              src={coverImage}
              alt={titleText}
              className="w-full h-auto max-h-[540px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-40 pointer-events-none" />
          </motion.div>
        )}
      </div>

      {/* ─── Main Content Grid (Content + Table of Contents) ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Prose Content Area */}
        <main className="lg:col-span-8">
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{rawMarkdown}</ReactMarkdown>
          </article>

          {/* Bottom Navigation CTA */}
          <div className="mt-16 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBackToPortfolio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/25 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Projects</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`w-full sm:w-auto px-5 py-3 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                isLightMode
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              &uarr; Back to Top
            </button>
          </div>
        </main>

        {/* Desktop Sticky Table of Contents */}
        {headings.length > 0 && (
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 rounded-3xl p-6 border backdrop-blur-xl transition-all shadow-lg bg-[#0f1422]/60 border-slate-800/80">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-orange-400">
                <BookOpen className="w-4 h-4" />
                <span>Mục lục Case Study</span>
              </div>
              <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                {headings.map((h) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      className={`w-full text-left font-['DM_Sans',sans-serif] text-xs sm:text-sm py-1.5 px-3 rounded-xl transition-all cursor-pointer block truncate ${
                        h.level === 3 ? 'pl-6' : 'pl-3'
                      } ${
                        isActive
                          ? 'bg-orange-500/15 text-orange-400 font-semibold border-l-2 border-orange-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                      title={h.text}
                    >
                      {h.text}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Mobile Table of Contents Modal ─── */}
      <AnimatePresence>
        {isTocOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden flex items-end justify-center"
            onClick={() => setIsTocOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-h-[70vh] rounded-t-3xl p-6 border-t shadow-2xl overflow-y-auto ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-[#0f1422] border-slate-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/40 mb-4">
                <span className="font-['Space_Grotesk',sans-serif] font-bold text-base text-orange-400">
                  Mục lục Case Study
                </span>
                <button
                  onClick={() => setIsTocOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => scrollToHeading(h.id)}
                    className={`w-full text-left py-2 px-3 rounded-xl text-sm transition-all block truncate ${
                      h.level === 3 ? 'pl-6' : 'pl-3'
                    } ${
                      activeHeadingId === h.id
                        ? 'bg-orange-500/20 text-orange-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lightbox Modal with Zoom ─── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
            onClick={() => {
              setLightboxImage(null);
              setZoomLevel(1);
            }}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => {
                  setLightboxImage(null);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors ml-2"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Image Preview */}
            <div
              className="max-w-6xl max-h-[80vh] overflow-auto p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={lightboxImage.src}
                alt={lightboxImage.alt || 'Zoomed view'}
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {lightboxImage.alt && (
              <p className="mt-3 text-xs sm:text-sm text-slate-300 italic text-center max-w-xl">
                {lightboxImage.alt}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarkdownCaseStudyRenderer;
