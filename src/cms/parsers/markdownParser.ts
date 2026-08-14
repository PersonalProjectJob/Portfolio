import type { ContentBlock, ContentEntry, LocalizedString } from '../types/cms.types';

export interface ParsedMarkdownHeading {
  id: string;
  text: string;
  level: number;
}

export interface ParsedMarkdownResult {
  metadata: Partial<ContentEntry> & {
    coverImage?: string;
    date?: string;
    tags?: string[];
    pdfUrl?: string;
    totalSlides?: number;
    slides?: string[];
  };
  blocks: ContentBlock[];
  rawMarkdown: string;
  headings: ParsedMarkdownHeading[];
  readingTimeMinutes: number;
}

/**
 * Converts any string to a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics for clean slugs
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Estimates reading time in minutes based on total word count.
 */
export function estimateReadingTime(text: string, wordsPerMinute = 200): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}

/**
 * Safely parses YAML or JSON frontmatter from a markdown string.
 */
export function parseFrontmatter(rawContent: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
  const match = normalized.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: normalized.trim() };
  }

  const rawYaml = match[1].trim();
  const body = match[2].trim();

  // 1. Try parsing JSON if frontmatter starts with {
  if (rawYaml.startsWith('{') && rawYaml.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(rawYaml);
      return { frontmatter: parsedJson, body };
    } catch {
      // Fall through to YAML parsing
    }
  }

  // 2. Parse lightweight YAML lines
  const frontmatter: Record<string, unknown> = {};
  const lines = rawYaml.split('\n');

  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item format: "  - item" or "- item"
    if (trimmed.startsWith('- ') && currentKey) {
      const itemVal = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
      if (!currentArray) {
        currentArray = [];
        frontmatter[currentKey] = currentArray;
      }
      currentArray.push(itemVal);
      continue;
    }

    // Key-value pair: "key: value"
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      currentArray = null;
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      if (value === '') {
        // May be followed by array items
        currentKey = key;
        frontmatter[key] = [];
        currentArray = frontmatter[key] as string[];
        continue;
      }

      // Check inline array format: "[a, b, c]"
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        value = inner
          ? inner
              .split(',')
              .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
              .filter(Boolean)
          : [];
      } else if (typeof value === 'string') {
        // Strip outer quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        } else if (value.toLowerCase() === 'true') {
          value = true;
        } else if (value.toLowerCase() === 'false') {
          value = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
      }

      currentKey = key;
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

/**
 * Extracts headings (#, ##, ###) and generates unique anchor IDs.
 */
export function extractHeadings(markdown: string): ParsedMarkdownHeading[] {
  const headings: ParsedMarkdownHeading[] = [];
  const lines = markdown.split('\n');
  const seenIds = new Set<string>();

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[#*`_~]/g, '').trim();
      let baseId = slugify(text);
      if (!baseId) baseId = `heading-${headings.length + 1}`;

      let uniqueId = baseId;
      let count = 2;
      while (seenIds.has(uniqueId)) {
        uniqueId = `${baseId}-${count}`;
        count++;
      }
      seenIds.add(uniqueId);

      headings.push({
        id: uniqueId,
        text,
        level,
      });
    }
  }

  return headings;
}

/**
 * Converts a string or object into a strict LocalizedString.
 */
function toLocalizedString(input: unknown, defaultVal = ''): LocalizedString {
  if (typeof input === 'string') {
    return { en: input, vi: input };
  }
  if (input && typeof input === 'object' && 'en' in input && 'vi' in input) {
    const loc = input as LocalizedString;
    return { en: loc.en || defaultVal, vi: loc.vi || defaultVal };
  }
  if (input && typeof input === 'object') {
    const str = String(Object.values(input)[0] || defaultVal);
    return { en: str, vi: str };
  }
  return { en: defaultVal, vi: defaultVal };
}

/**
 * Parses markdown into atomic ContentBlock structures (Hero, RichText, Quote, Media, BulletList, Code, Table).
 */
export function parseMarkdownBlocks(
  markdownBody: string,
  meta: Record<string, unknown>
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockCounter = 1;

  const createId = (type: string) => `block-${type}-${blockCounter++}`;

  // 1. If cover image or title metadata exists, generate a Hero Block
  const titleStr = typeof meta.title === 'string' ? meta.title : '';
  const summaryStr = typeof meta.summary === 'string' ? meta.summary : '';
  const coverImage = (meta.coverImage || meta.cover_image || meta.og_image || '') as string;
  const category = (meta.category || 'Product Design') as string;
  const role = (meta.role || '') as string;
  const date = (meta.date || meta.published_at || '') as string;

  if (coverImage || titleStr) {
    blocks.push({
      id: createId('hero'),
      type: 'Hero',
      visible: true,
      data: {
        title: titleStr,
        summary: summaryStr,
        coverImage,
        category,
        role,
        date,
      },
    });
  }

  // 2. Parse Markdown Body into structured chunks
  const rawSections = markdownBody.split(/\n{2,}/);

  for (const section of rawSections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Check for Heading Block
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].replace(/[#*`_~]/g, '').trim();
      blocks.push({
        id: createId('heading'),
        type: 'Heading',
        visible: true,
        data: {
          level,
          text,
          id: slugify(text),
        },
      });
      continue;
    }

    // Check for Blockquote Block
    if (trimmed.startsWith('>')) {
      const quoteLines = trimmed
        .split('\n')
        .map((l) => l.replace(/^>\s?/, '').trim())
        .filter(Boolean);
      const fullText = quoteLines.join(' ');
      blocks.push({
        id: createId('quote'),
        type: 'Quote',
        visible: true,
        data: {
          text: fullText,
        },
      });
      continue;
    }

    // Check for Fenced Code Block
    const codeMatch = trimmed.match(/^```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)\n```$/);
    if (codeMatch) {
      blocks.push({
        id: createId('code'),
        type: 'Code',
        visible: true,
        data: {
          language: codeMatch[1] || 'plaintext',
          code: codeMatch[2],
        },
      });
      continue;
    }

    // Check for Standalone Image / Media Block
    const mediaMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (mediaMatch) {
      blocks.push({
        id: createId('media'),
        type: 'Media',
        visible: true,
        data: {
          alt: mediaMatch[1] || '',
          url: mediaMatch[2],
          caption: mediaMatch[3] || mediaMatch[1] || '',
        },
      });
      continue;
    }

    // Check for Markdown Table
    if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines[0].startsWith('|') && lines[1].includes('---')) {
        const headers = lines[0]
          .split('|')
          .slice(1, -1)
          .map((h) => h.trim());
        const rows = lines.slice(2).map((rowLine) =>
          rowLine
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        blocks.push({
          id: createId('table'),
          type: 'Table',
          visible: true,
          data: {
            headers,
            rows,
          },
        });
        continue;
      }
    }

    // Check for Bullet or Ordered List
    const isBulletList = trimmed.split('\n').every((l) => /^\s*[-*+]\s+/.test(l));
    const isOrderedList = trimmed.split('\n').every((l) => /^\s*\d+\.\s+/.test(l));

    if (isBulletList || isOrderedList) {
      const items = trimmed.split('\n').map((l) => {
        return l.replace(/^\s*([*+-]|\d+\.)\s+/, '').trim();
      });

      blocks.push({
        id: createId('list'),
        type: 'BulletList',
        visible: true,
        data: {
          ordered: isOrderedList,
          items,
        },
      });
      continue;
    }

    // Default: RichText Block
    blocks.push({
      id: createId('richtext'),
      type: 'RichText',
      visible: true,
      data: {
        content: trimmed,
      },
    });
  }

  return blocks;
}

/**
 * Main parser function:
 * - Ingests .md file string
 * - Extracts frontmatter and body
 * - Generates partial ContentEntry metadata
 * - Segments atomic blocks (Hero, RichText, Quote, Media, BulletList)
 * - Returns structured ParsedMarkdownResult
 */
export function parseMarkdownFile(content: string): ParsedMarkdownResult {
  const { frontmatter, body } = parseFrontmatter(content);
  const headings = extractHeadings(body);
  const blocks = parseMarkdownBlocks(body, frontmatter);
  const readingTimeMinutes = estimateReadingTime(body);

  const titleRaw = (frontmatter.title || headings[0]?.text || 'Untitled Case Study') as string;
  const title = toLocalizedString(titleRaw, 'Untitled Case Study');

  const slugRaw = (frontmatter.slug as string) || slugify(title.en || 'untitled');
  const summaryRaw = (frontmatter.summary as string) || '';
  const summary = toLocalizedString(summaryRaw, '');

  const category = (frontmatter.category as string) || 'Product Design';
  const role = (frontmatter.role as string) || null;
  const coverImage = (frontmatter.coverImage ||
    frontmatter.cover_image ||
    frontmatter.og_image ||
    '') as string;
  const date = (frontmatter.date || frontmatter.published_at || new Date().toISOString()) as string;

  const rawTags = frontmatter.tags || frontmatter.keywords || [];
  const tags: string[] = Array.isArray(rawTags)
    ? (rawTags as string[])
    : typeof rawTags === 'string'
      ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  const pdfUrl = (frontmatter.pdf_url || frontmatter.pdfUrl || '') as string;
  const totalSlides = Number(frontmatter.total_slides || frontmatter.totalSlides || 0);
  const slides = Array.isArray(frontmatter.slides) ? (frontmatter.slides as string[]) : [];

  const renderMode = (frontmatter.render_mode || (pdfUrl ? 'pdf_deck' : 'markdown')) as ContentEntry['render_mode'];

  const metadata: Partial<ContentEntry> & {
    coverImage?: string;
    date?: string;
    tags?: string[];
    pdfUrl?: string;
    totalSlides?: number;
    slides?: string[];
  } = {
    id: slugRaw,
    slug: slugRaw,
    route: `/project/${slugRaw}`,
    title,
    summary,
    category,
    role,
    status: (frontmatter.status as ContentEntry['status']) || 'published',
    render_mode: renderMode,
    featured: Boolean(frontmatter.featured ?? false),
    sort_order: Number(frontmatter.sort_order ?? 99),
    coverImage,
    date,
    tags,
    pdfUrl,
    totalSlides,
    slides,
    seo: {
      title: title.en,
      description: summary.en,
      og_image: coverImage || `/assets/case-studies/${slugRaw}-preview.png`,
      keywords: [category, ...(role ? [role] : []), ...tags],
    },
    published_document: {
      schemaVersion: 1,
      blocks,
    },
    draft_document: {
      schemaVersion: 1,
      blocks,
    },
    published_at: date,
    created_at: date,
    updated_at: new Date().toISOString(),
  };

  return {
    metadata,
    blocks,
    rawMarkdown: body,
    headings,
    readingTimeMinutes,
  };
}
