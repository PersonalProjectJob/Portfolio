import { z } from 'zod';
import type { LocalizedString, ContentBlock } from '../types/cms.types';

/**
 * Universal Localized String helper
 */
export function resolveLocalizedString(
  value: LocalizedString | string | undefined | null,
  lang: 'vi' | 'en' = 'vi'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[lang] || value.vi || value.en || '';
  }
  return String(value);
}

/**
 * Converts any string or partial localized input into a strict LocalizedString object
 */
export function normalizeLocalizedString(
  input: unknown,
  fallback = ''
): LocalizedString {
  if (typeof input === 'string') {
    return { en: input, vi: input };
  }
  if (input && typeof input === 'object' && 'en' in input && 'vi' in input) {
    const obj = input as { en?: unknown; vi?: unknown };
    return {
      en: typeof obj.en === 'string' ? obj.en : fallback,
      vi: typeof obj.vi === 'string' ? obj.vi : fallback,
    };
  }
  if (input && typeof input === 'object') {
    const firstVal = Object.values(input)[0];
    const str = typeof firstVal === 'string' ? firstVal : fallback;
    return { en: str, vi: str };
  }
  return { en: fallback, vi: fallback };
}

// ─── ZOD SCHEMAS ───────────────────────────────────────────

export const LocalizedStringOrStringSchema = z.union([
  z.string(),
  z.object({
    en: z.string(),
    vi: z.string(),
  }),
]);

/**
 * 1. HERO BLOCK SCHEMA
 */
export const HeroBlockMetricSchema = z.object({
  value: z.string(),
  label: LocalizedStringOrStringSchema,
  note: LocalizedStringOrStringSchema.optional(),
});

export const HeroBlockSchema = z.object({
  eyebrow: LocalizedStringOrStringSchema.optional(),
  title: LocalizedStringOrStringSchema,
  subtitle: LocalizedStringOrStringSchema.optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  role: z.string().optional(),
  date: z.string().optional(),
  metrics: z.array(HeroBlockMetricSchema).optional(),
});

export type HeroBlockMetric = z.infer<typeof HeroBlockMetricSchema>;
export type HeroBlockData = z.infer<typeof HeroBlockSchema>;

/**
 * 2. OVERVIEW BLOCK SCHEMA
 */
export const OverviewCoreMetricSchema = z.object({
  value: z.string(),
  label: LocalizedStringOrStringSchema,
  description: LocalizedStringOrStringSchema.optional(),
});

export const OverviewBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  problem: LocalizedStringOrStringSchema,
  problemPoints: z.array(LocalizedStringOrStringSchema).optional(),
  solution: LocalizedStringOrStringSchema,
  solutionPoints: z.array(LocalizedStringOrStringSchema).optional(),
  role: LocalizedStringOrStringSchema.optional(),
  timeline: LocalizedStringOrStringSchema.optional(),
  coreMetric: OverviewCoreMetricSchema.optional(),
});

export type OverviewCoreMetric = z.infer<typeof OverviewCoreMetricSchema>;
export type OverviewBlockData = z.infer<typeof OverviewBlockSchema>;

/**
 * 3. RICH TEXT BLOCK SCHEMA
 */
export const RichTextBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  content: LocalizedStringOrStringSchema,
  layout: z.enum(['single', 'two-column']).optional(),
  columnTwoContent: LocalizedStringOrStringSchema.optional(),
});

export type RichTextBlockData = z.infer<typeof RichTextBlockSchema>;

/**
 * 4. MEDIA BLOCK SCHEMA
 */
export const MediaItemSchema = z.object({
  url: z.string(),
  caption: LocalizedStringOrStringSchema.optional(),
  alt: z.string().optional(),
  aspectRatio: z.enum(['16/9', '4/3', '1/1', 'auto', '3/2']).optional(),
  type: z.enum(['image', 'video']).optional(),
});

export const ComparisonSliderSchema = z.object({
  enabled: z.boolean(),
  beforeImage: z.string(),
  afterImage: z.string(),
  beforeLabel: LocalizedStringOrStringSchema.optional(),
  afterLabel: LocalizedStringOrStringSchema.optional(),
});

export const MediaBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  description: LocalizedStringOrStringSchema.optional(),
  layout: z.enum(['single', 'grid-2', 'grid-3', 'slider']).optional(),
  items: z.array(MediaItemSchema).optional(),
  comparisonSlider: ComparisonSliderSchema.optional(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type ComparisonSlider = z.infer<typeof ComparisonSliderSchema>;
export type MediaBlockData = z.infer<typeof MediaBlockSchema>;

/**
 * 5. STATS BLOCK SCHEMA
 */
export const StatCardSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  label: LocalizedStringOrStringSchema,
  change: z.string().optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  note: LocalizedStringOrStringSchema.optional(),
  icon: z.string().optional(),
});

export const StatsBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  subtitle: LocalizedStringOrStringSchema.optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  cards: z.array(StatCardSchema),
});

export type StatCard = z.infer<typeof StatCardSchema>;
export type StatsBlockData = z.infer<typeof StatsBlockSchema>;

/**
 * 6. PROCESS STEPS BLOCK SCHEMA
 */
export const ProcessStepItemSchema = z.object({
  stepNumber: z.number().optional(),
  phase: LocalizedStringOrStringSchema.optional(),
  title: LocalizedStringOrStringSchema,
  description: LocalizedStringOrStringSchema.optional(),
  deliverables: z.array(z.string()).optional(),
  icon: z.string().optional(),
});

export const ProcessStepsBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  subtitle: LocalizedStringOrStringSchema.optional(),
  steps: z.array(ProcessStepItemSchema),
});

export type ProcessStepItem = z.infer<typeof ProcessStepItemSchema>;
export type ProcessStepsBlockData = z.infer<typeof ProcessStepsBlockSchema>;

/**
 * 7. DECISION BLOCK SCHEMA
 */
export const DecisionOptionSchema = z.object({
  title: z.string(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  selected: z.boolean().optional(),
});

export const DecisionItemSchema = z.object({
  id: z.string().optional(),
  problem: LocalizedStringOrStringSchema,
  options: z.array(DecisionOptionSchema),
  decision: LocalizedStringOrStringSchema,
  impact: LocalizedStringOrStringSchema,
  why: LocalizedStringOrStringSchema.optional(),
});

export const DecisionBlockSchema = z.object({
  sectionTitle: LocalizedStringOrStringSchema.optional(),
  subtitle: LocalizedStringOrStringSchema.optional(),
  items: z.array(DecisionItemSchema),
});

export type DecisionOption = z.infer<typeof DecisionOptionSchema>;
export type DecisionItem = z.infer<typeof DecisionItemSchema>;
export type DecisionBlockData = z.infer<typeof DecisionBlockSchema>;

/**
 * 8. CALLOUT BLOCK SCHEMA
 */
export const CalloutBlockSchema = z.object({
  type: z.enum(['insight', 'quote', 'warning', 'tip', 'key_takeaway']).optional(),
  title: LocalizedStringOrStringSchema.optional(),
  content: LocalizedStringOrStringSchema,
  author: z.string().optional(),
  role: z.string().optional(),
  quoteSource: z.string().optional(),
});

export type CalloutBlockData = z.infer<typeof CalloutBlockSchema>;

// ─── UNIONS AND REGISTRY MAPS ──────────────────────────────

export type BlockType =
  | 'hero'
  | 'overview'
  | 'rich_text'
  | 'media'
  | 'stats'
  | 'process_steps'
  | 'decision'
  | 'callout';

export type BlockDataMap = {
  hero: HeroBlockData;
  overview: OverviewBlockData;
  rich_text: RichTextBlockData;
  media: MediaBlockData;
  stats: StatsBlockData;
  process_steps: ProcessStepsBlockData;
  decision: DecisionBlockData;
  callout: CalloutBlockData;
};

export type AnyBlockData =
  | HeroBlockData
  | OverviewBlockData
  | RichTextBlockData
  | MediaBlockData
  | StatsBlockData
  | ProcessStepsBlockData
  | DecisionBlockData
  | CalloutBlockData
  | Record<string, unknown>;

export interface TypedContentBlock<T extends BlockType = BlockType>
  extends ContentBlock<BlockDataMap[T]> {
  type: T;
}

export const BlockSchemaMap: Record<BlockType, z.ZodTypeAny> = {
  hero: HeroBlockSchema,
  overview: OverviewBlockSchema,
  rich_text: RichTextBlockSchema,
  media: MediaBlockSchema,
  stats: StatsBlockSchema,
  process_steps: ProcessStepsBlockSchema,
  decision: DecisionBlockSchema,
  callout: CalloutBlockSchema,
};

/**
 * Validates a block's data payload against its Zod schema
 */
export function validateBlockData(
  type: string,
  data: unknown
): { success: boolean; data?: unknown; error?: z.ZodError } {
  const schema = BlockSchemaMap[type as BlockType];
  if (!schema) {
    return { success: true, data };
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
