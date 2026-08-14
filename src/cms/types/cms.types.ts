/**
 * CMS & Content Schema Type Definitions
 * Strict TypeScript models for Headless CMS, Hybrid Project Registry, and Site Configuration.
 */

import type { ProjectNodeGroup, NodeAnchor, ProjectEdge } from '../../components/project-graph/projectGraph.types';

export interface LocalizedString {
  en: string;
  vi: string;
}

export interface SiteProfile {
  name: string;
  title: string;
  headline?: string;
  location?: string;
  email: string;
  telegram?: string;
  linkedin: string;
  github?: string;
  avatar?: string;
  cv_path?: string;
  bio: LocalizedString;
}

export interface SiteSkills {
  design?: string[];
  engineering?: string[];
  ai_automation?: string[];
  [category: string]: string[] | undefined;
}

export interface SiteExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string | LocalizedString;
  details?: string[];
}

export interface SiteProcessItem {
  step: number;
  title: string | LocalizedString;
  desc: string | LocalizedString;
  icon?: string;
  details?: string[];
}

export interface SeoDefaults {
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
}

export interface SiteSettings {
  id?: string;
  profile: SiteProfile;
  skills: SiteSkills;
  experience: SiteExperienceItem[];
  process: SiteProcessItem[];
  seo_defaults: SeoDefaults;
  created_at?: string;
  updated_at?: string;
}

export type ContentEntryStatus = 'draft' | 'published' | 'archived';

export type RenderMode = 'legacy' | 'builder' | 'markdown' | 'pdf_deck';

export interface ContentBlock<T = Record<string, unknown>> {
  id: string;
  type: string;
  visible: boolean;
  data: T;
}

export interface ContentDocument {
  schemaVersion: number;
  blocks: ContentBlock[];
}

export interface ContentEntryGraphConfig {
  shortName?: string;
  zone?: ProjectNodeGroup;
  parentId?: string;
  edgeType?: ProjectEdge['type'];
  order?: number;
  eyebrow?: string;
  positionOverride?: { x: number; y: number };
  noteAnchor?: NodeAnchor;
  slot?: string;
  [key: string]: unknown;
}

export interface ContentEntrySeo {
  title?: string | LocalizedString;
  description?: string | LocalizedString;
  og_image?: string;
  keywords?: string[];
}

export interface ContentEntry {
  id: string;
  slug: string;
  route: string;
  title: LocalizedString;
  summary: LocalizedString;
  category: string;
  role?: string | null;
  status: ContentEntryStatus;
  render_mode: RenderMode;
  legacy_key?: string | null;
  template_key?: string | null;
  featured: boolean;
  sort_order: number;
  graph_config?: ContentEntryGraphConfig | null;
  seo?: ContentEntrySeo | null;
  draft_document?: ContentDocument | null;
  published_document?: ContentDocument | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrackingLink {
  id: string;
  slug: string;
  destination_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign?: string | null;
  utm_content?: string | null;
  clicks_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MediaAsset {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text: LocalizedString;
  created_at?: string;
}
