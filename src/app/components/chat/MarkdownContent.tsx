/**
 * MarkdownContent — rich markdown renderer for AI chat responses.
 * Uses react-markdown + remark-gfm (tables, strikethrough, etc.)
 * All styling uses CSS variables from /src/styles/theme.css
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
  /** Whether the bubble is from the user (light-on-dark) */
  isUser?: boolean;
  /** Use report-style spacing instead of chat bubble spacing. */
  variant?: "bubble" | "report";
  /** Tighten the report layout for mobile/small viewports. */
  density?: "comfortable" | "compact";
}

/** Custom components for react-markdown — all tokens from design system */
function useMarkdownComponents(
  isUser: boolean,
  variant: "bubble" | "report",
  density: "comfortable" | "compact",
): Components {
  const isReport = variant === "report";
  const isCompactReport = isReport && density === "compact";
  /* Shared text color reference for user vs assistant bubbles */
  const textClass = isUser ? "text-primary-foreground" : "text-foreground";
  const bodyFontSize = isCompactReport ? "var(--font-size-small)" : "var(--font-size-body)";
  const headingLargeFontSize = isCompactReport ? "var(--font-size-body)" : "var(--font-size-h2)";
  const headingMediumFontSize = isCompactReport ? "var(--font-size-small)" : "var(--font-size-body)";
  const headingSmallFontSize = isCompactReport ? "var(--font-size-caption)" : "var(--font-size-small)";
  const blockSpacing = isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-xs)";
  const listSpacing = isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-xs)";
  const listPadding = isCompactReport ? "var(--spacing-sm)" : "var(--spacing-md)";
  const headingTopMargin = isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-md)";
  const headingBottomMargin = isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-xs)";

  return {
    /* ── Block elements ────────────────────────────────────── */

    h1: ({ children }) => (
      <h3
        className={textClass}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingLargeFontSize,
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
          lineHeight: 1.25,
          margin: 0,
          marginTop: headingTopMargin,
          marginBottom: headingBottomMargin,
        }}
      >
        {children}
      </h3>
    ),

    h2: ({ children }) => (
      <h4
        className={textClass}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingMediumFontSize,
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
          lineHeight: 1.25,
          margin: 0,
          marginTop: headingTopMargin,
          marginBottom: headingBottomMargin,
        }}
      >
        {children}
      </h4>
    ),

    h3: ({ children }) => (
      <h5
        className={textClass}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingMediumFontSize,
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
          lineHeight: 1.4,
          margin: 0,
          marginTop: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-base)",
          marginBottom: headingBottomMargin,
        }}
      >
        {children}
      </h5>
    ),

    h4: ({ children }) => (
      <h6
        className={textClass}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingSmallFontSize,
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
          lineHeight: 1.4,
          margin: 0,
          marginTop: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
          marginBottom: headingBottomMargin,
        }}
      >
        {children}
      </h6>
    ),

    p: ({ children }) => (
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: bodyFontSize,
          fontWeight: "var(--font-weight-normal)" as unknown as number,
          lineHeight: isCompactReport ? 1.55 : isReport ? 1.6 : 1.65,
          margin: 0,
          marginTop: isReport ? blockSpacing : "var(--spacing-xs)",
          marginBottom: isReport ? blockSpacing : "var(--spacing-xs)",
          minWidth: 0,
          maxWidth: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {children}
      </p>
    ),

    /* ── Lists ─────────────────────────────────────────────── */

    ul: ({ children }) => (
      <ul
        style={{
          margin: 0,
          marginTop: isReport ? blockSpacing : "var(--spacing-xs)",
          marginBottom: isReport ? blockSpacing : "var(--spacing-xs)",
          paddingLeft: listPadding,
          listStyleType: "disc",
          display: "grid",
          gap: isReport ? listSpacing : "var(--spacing-2xs)",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol
        style={{
          margin: 0,
          marginTop: isReport ? blockSpacing : "var(--spacing-xs)",
          marginBottom: isReport ? blockSpacing : "var(--spacing-xs)",
          paddingLeft: listPadding,
          listStyleType: "decimal",
          display: "grid",
          gap: isReport ? listSpacing : "var(--spacing-2xs)",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: bodyFontSize,
          fontWeight: "var(--font-weight-normal)" as unknown as number,
          lineHeight: isCompactReport ? 1.55 : 1.6,
          minWidth: 0,
          maxWidth: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {children}
      </li>
    ),

    /* ── Inline ────────────────────────────────────────────── */

    strong: ({ children }) => (
      <strong
        style={{
          fontWeight: isReport ? 700 : ("var(--font-weight-semibold)" as unknown as number),
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em style={{ fontStyle: "italic" }}>{children}</em>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={isUser ? "text-primary-foreground underline" : "text-secondary underline"}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "inherit",
          fontWeight: "var(--font-weight-medium)" as unknown as number,
        }}
      >
        {children}
      </a>
    ),

    code: ({ children, className }) => {
      /* inline code vs code block */
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <code
            className={isUser ? "bg-primary-foreground/15" : "bg-foreground/5"}
            style={{
              fontFamily: "monospace",
              fontSize: headingSmallFontSize,
              display: "block",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              padding: "var(--spacing-sm)",
              borderRadius: "var(--radius)",
              lineHeight: 1.5,
            }}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className={isUser ? "bg-primary-foreground/15" : "bg-foreground/8"}
          style={{
            fontFamily: "monospace",
            fontSize: headingSmallFontSize,
            padding: "1px var(--spacing-2xs)",
            borderRadius: "4px",
          }}
        >
          {children}
        </code>
      );
    },

    pre: ({ children }) => (
      <pre
        style={{
          margin: 0,
          marginTop: blockSpacing,
          marginBottom: blockSpacing,
          overflow: "hidden",
        }}
      >
        {children}
      </pre>
    ),

    /* ── Horizontal rule ───────────────────────────────────── */

    hr: () => (
      <hr
        className={isUser ? "border-primary-foreground/20" : "border-border"}
        style={{
          border: "none",
          borderTop: "1px solid",
          borderColor: "inherit",
          marginTop: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
          marginBottom: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
        }}
      />
    ),

    /* ── Blockquote ─────────────────────────────────────────── */

    blockquote: ({ children }) => (
      <blockquote
        className={isUser ? "border-primary-foreground/30" : "border-secondary/40"}
        style={{
          margin: 0,
          marginTop: blockSpacing,
          marginBottom: blockSpacing,
          paddingLeft: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
          borderLeftWidth: "3px",
          borderLeftStyle: "solid",
          fontStyle: "italic",
          opacity: 0.9,
        }}
      >
        {children}
      </blockquote>
    ),

    /* ── Table (GFM) ───────────────────────────────────────── */

    table: ({ children }) => (
      <div
        style={{
          overflowX: "auto",
          marginTop: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
          marginBottom: isCompactReport ? "var(--spacing-2xs)" : "var(--spacing-sm)",
          borderRadius: "var(--radius)",
          border: "1px solid",
          borderColor: isUser
            ? "rgba(255,255,255,0.15)"
            : "var(--border)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "'Inter', sans-serif",
            fontSize: headingSmallFontSize,
          }}
        >
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead
        className={isUser ? "bg-primary-foreground/10" : "bg-muted"}
      >
        {children}
      </thead>
    ),

    th: ({ children }) => (
      <th
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingSmallFontSize,
          fontWeight: "var(--font-weight-semibold)" as unknown as number,
          textAlign: "left",
          padding: "var(--spacing-xs) var(--spacing-sm)",
          borderBottom: "1px solid",
          borderColor: isUser
            ? "rgba(255,255,255,0.15)"
            : "var(--border)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: headingSmallFontSize,
          fontWeight: "var(--font-weight-normal)" as unknown as number,
          lineHeight: 1.5,
          padding: "var(--spacing-xs) var(--spacing-sm)",
          borderBottom: "1px solid",
          borderColor: isUser
            ? "rgba(255,255,255,0.08)"
            : "var(--border)",
          verticalAlign: "top",
        }}
      >
        {children}
      </td>
    ),

    tr: ({ children }) => <tr>{children}</tr>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
  };
}

export function MarkdownContent({
  content,
  isUser = false,
  variant = "bubble",
  density = "comfortable",
}: MarkdownContentProps) {
  const components = useMarkdownComponents(isUser, variant, density);

  return (
    <div
      className="markdown-content"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: density === "compact" && variant === "report" ? "var(--font-size-small)" : "var(--font-size-body)",
        fontWeight: "var(--font-weight-normal)" as unknown as number,
        lineHeight: density === "compact" && variant === "report" ? 1.55 : 1.6,
        display: "grid",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        /* Compensate first/last child spacing so bubble padding controls the gap */
        marginTop: variant === "report" ? 0 : "calc(-1 * var(--spacing-xs))",
        marginBottom: variant === "report" ? 0 : "calc(-1 * var(--spacing-xs))",
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
