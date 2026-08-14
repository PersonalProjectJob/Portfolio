import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Copy, Check, ExternalLink, Quote as QuoteIcon } from 'lucide-react';
import type { RichTextBlockData } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';
import { slugify } from '../../parsers/markdownParser';

export interface RichTextBlockRendererProps {
  data: RichTextBlockData;
  className?: string;
}

export const RichTextBlockRenderer: React.FC<RichTextBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle = resolveLocalizedString(data.sectionTitle, language);
  const content = resolveLocalizedString(data.content, language);
  const columnTwoContent = resolveLocalizedString(data.columnTwoContent, language);
  const isTwoColumn = data.layout === 'two-column';

  // Custom Code Block component with Copy Button
  const CodeBlock = ({
    inline,
    className: codeClassName,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(codeClassName || '');
    const lang = match ? match[1] : '';
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
              ? 'bg-teal-100 text-teal-800 border border-teal-200'
              : 'bg-teal-950/40 text-teal-300 border border-teal-500/30'
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
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span className="uppercase tracking-wider font-medium text-teal-400">
            {lang || 'Code'}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs cursor-pointer active:scale-95"
            title="Copy code"
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

  // Custom Table component
  const MarkdownTable = ({ children }: { children?: React.ReactNode }) => (
    <div className="my-6 w-full overflow-x-auto rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm">{children}</table>
    </div>
  );

  const markdownComponents: Components = {
    h1: ({ children }) => {
      const headingText = String(children);
      const id = slugify(headingText);
      return (
        <h1
          id={id}
          className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 scroll-mt-24 pb-2 border-b border-teal-500/20 flex items-center group"
        >
          <span className="flex-1">{children}</span>
          {id && (
            <a
              href={`#${id}`}
              className="opacity-0 group-hover:opacity-100 text-teal-500 text-lg ml-2 transition-opacity"
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
      const id = slugify(headingText);
      return (
        <h2
          id={id}
          className="font-['Space_Grotesk',sans-serif] text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 scroll-mt-24 pl-4 border-l-4 border-teal-500 flex items-center group"
        >
          <span className="flex-1">{children}</span>
          {id && (
            <a
              href={`#${id}`}
              className="opacity-0 group-hover:opacity-100 text-teal-500 text-base ml-2 transition-opacity"
              aria-label="Anchor link"
            >
              #
            </a>
          )}
        </h2>
      );
    },
    h3: ({ children }) => (
      <h3 className="font-['Space_Grotesk',sans-serif] text-lg sm:text-xl font-bold mt-6 mb-2 text-teal-400">
        {children}
      </h3>
    ),
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
        className={`font-['DM_Sans',sans-serif] list-disc list-outside pl-6 my-4 space-y-2 text-base leading-relaxed ${
          isLightMode ? 'text-slate-700 marker:text-teal-600' : 'text-slate-300 marker:text-teal-400'
        }`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`font-['DM_Sans',sans-serif] list-decimal list-outside pl-6 my-4 space-y-2 text-base leading-relaxed ${
          isLightMode ? 'text-slate-700 marker:text-teal-600' : 'text-slate-300 marker:text-teal-400'
        }`}
      >
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <div
        className={`relative my-6 p-5 rounded-2xl border backdrop-blur-xl transition-all shadow-md ${
          isLightMode
            ? 'bg-teal-50/70 border-teal-200 text-slate-800'
            : 'bg-[#0f172a]/70 border-teal-500/30 text-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <QuoteIcon className="w-5 h-5 text-teal-400 shrink-0 mt-1 opacity-80" />
          <div className="font-['DM_Sans',sans-serif] italic text-base leading-relaxed">
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
    th: ({ children }) => (
      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider font-mono">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-sm">{children}</td>,
    code: CodeBlock as any,
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http') || href?.startsWith('//');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-0.5 text-teal-400 hover:text-teal-300 underline underline-offset-4 decoration-teal-400/50 hover:decoration-teal-400 font-medium transition-colors"
        >
          <span>{children}</span>
          {isExternal && <ExternalLink className="w-3 h-3 ml-0.5 inline opacity-70" />}
        </a>
      );
    },
  };

  return (
    <section className={`relative w-full py-6 sm:py-10 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {sectionTitle && (
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-balance"
          >
            {sectionTitle}
          </motion.h2>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className={isTwoColumn ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'w-full'}
        >
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>

          {isTwoColumn && columnTwoContent && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown components={markdownComponents}>{columnTwoContent}</ReactMarkdown>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
