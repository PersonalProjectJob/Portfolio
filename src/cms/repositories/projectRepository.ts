import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { ContentEntry } from '../types/cms.types';
import { DEFAULT_PROJECT_ENTRIES } from '../../content/legacy/legacyProjectManifest';

const STORAGE_KEY = 'portfolio_projects_cache';
let inMemoryFallbackProjects: ContentEntry[] = [...DEFAULT_PROJECT_ENTRIES];

/**
 * Reads locally cached project entries or initializes with DEFAULT_PROJECT_ENTRIES.
 */
export function getLocalCachedProjects(): ContentEntry[] {
  if (typeof window === 'undefined') return [...inMemoryFallbackProjects];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECT_ENTRIES));
      return [...DEFAULT_PROJECT_ENTRIES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...DEFAULT_PROJECT_ENTRIES];
  } catch (err) {
    console.warn('[projectRepository] Failed to read local project cache:', err);
    return [...DEFAULT_PROJECT_ENTRIES];
  }
}

/**
 * Persists project entries into local storage for offline resilience.
 */
export function saveLocalCachedProjects(projects: ContentEntry[]): void {
  inMemoryFallbackProjects = [...projects];
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn('[projectRepository] Failed to save local project cache:', err);
  }
}

export interface ProjectFilter {
  status?: string;
  category?: string;
  search?: string;
}

/**
 * Fetches all project entries with optional status/category filters.
 * Queries Supabase `content_entries` when configured, or returns local cache/manifest fallback.
 */
export async function fetchProjects(filter?: ProjectFilter): Promise<ContentEntry[]> {
  const localList = getLocalCachedProjects();

  if (!isSupabaseConfigured) {
    let filtered = [...localList];
    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.en.toLowerCase().includes(q) ||
          p.title.vi.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.role && p.role.toLowerCase().includes(q))
      );
    }
    // Sort by sort_order ascending
    return filtered.sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
  }

  try {
    let query = supabase
      .from('content_entries')
      .select('*')
      .order('sort_order', { ascending: true });

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[projectRepository] Supabase query failed, using local cache:', error.message);
      return localList;
    }

    if (data && data.length > 0) {
      const formatted: ContentEntry[] = (data as unknown as ContentEntry[]).map((p) => ({
        ...p,
        title: typeof p.title === 'string' ? { en: p.title, vi: p.title } : p.title,
        summary: typeof p.summary === 'string' ? { en: p.summary, vi: p.summary } : p.summary,
      }));
      saveLocalCachedProjects(formatted);
      return formatted;
    }

    return localList;
  } catch (err) {
    console.warn('[projectRepository] Error fetching projects from Supabase:', err);
    return localList;
  }
}

/**
 * Fetches a single project entry by its URL slug.
 */
export async function fetchProjectBySlug(slug: string): Promise<ContentEntry | null> {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  const localList = getLocalCachedProjects();
  const localMatch = localList.find(
    (p) => p.slug.toLowerCase() === normalizedSlug || p.legacy_key?.toLowerCase() === normalizedSlug
  );

  if (!isSupabaseConfigured) {
    return localMatch || null;
  }

  try {
    const { data, error } = await supabase
      .from('content_entries')
      .select('*')
      .or(`slug.eq.${normalizedSlug},legacy_key.eq.${normalizedSlug}`)
      .maybeSingle();

    if (error || !data) {
      return localMatch || null;
    }

    const formatted: ContentEntry = {
      ...(data as unknown as ContentEntry),
      title: typeof data.title === 'string' ? { en: data.title, vi: data.title } : data.title,
      summary: typeof data.summary === 'string' ? { en: data.summary, vi: data.summary } : data.summary,
    };
    return formatted;
  } catch (err) {
    console.warn('[projectRepository] Error fetching project by slug:', err);
    return localMatch || null;
  }
}

/**
 * Inserts a new project into Supabase or local cache.
 */
export async function createProject(project: Partial<ContentEntry>): Promise<ContentEntry> {
  const timestamp = new Date().toISOString();
  const id = project.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`);
  const slug = project.slug || `project-${Date.now()}`;
  const route = project.route || `/project/${slug}`;

  const newEntry: ContentEntry = {
    id,
    slug,
    route,
    title: project.title || { en: 'New Case Study', vi: 'Dự án mới' },
    summary: project.summary || { en: '', vi: '' },
    category: project.category || 'Product Design',
    role: project.role || null,
    status: project.status || 'draft',
    render_mode: project.render_mode || 'builder',
    legacy_key: project.legacy_key || null,
    template_key: project.template_key || 'standard',
    featured: Boolean(project.featured),
    sort_order: project.sort_order ?? 99,
    graph_config: project.graph_config || null,
    seo: project.seo || {
      title: project.title?.en || 'New Case Study',
      description: project.summary?.en || '',
      og_image: '',
      keywords: [],
    },
    draft_document: project.draft_document || {
      schemaVersion: 1,
      blocks: [],
    },
    published_document: project.published_document || {
      schemaVersion: 1,
      blocks: [],
    },
    published_at: project.status === 'published' ? timestamp : null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  // Always update local cache
  const localList = getLocalCachedProjects();
  const updatedList = [newEntry, ...localList.filter((p) => p.id !== newEntry.id)];
  saveLocalCachedProjects(updatedList);

  if (!isSupabaseConfigured) {
    return newEntry;
  }

  try {
    const { data, error } = await supabase
      .from('content_entries')
      .insert({
        id: newEntry.id,
        slug: newEntry.slug,
        route: newEntry.route,
        title: newEntry.title,
        summary: newEntry.summary,
        category: newEntry.category,
        role: newEntry.role,
        status: newEntry.status,
        render_mode: newEntry.render_mode,
        legacy_key: newEntry.legacy_key,
        template_key: newEntry.template_key,
        featured: newEntry.featured,
        sort_order: newEntry.sort_order,
        graph_config: newEntry.graph_config,
        seo: newEntry.seo,
        draft_document: newEntry.draft_document,
        published_document: newEntry.published_document,
        published_at: newEntry.published_at,
        created_at: newEntry.created_at,
        updated_at: newEntry.updated_at,
      })
      .select()
      .single();

    if (error) {
      console.warn('[projectRepository] Supabase insert warning, saved locally:', error.message);
      return newEntry;
    }

    if (data) {
      const result: ContentEntry = {
        ...(data as unknown as ContentEntry),
        title: typeof data.title === 'string' ? { en: data.title, vi: data.title } : data.title,
        summary: typeof data.summary === 'string' ? { en: data.summary, vi: data.summary } : data.summary,
      };
      saveLocalCachedProjects([result, ...localList.filter((p) => p.id !== result.id)]);
      return result;
    }

    return newEntry;
  } catch (err) {
    console.warn('[projectRepository] Supabase insert failed, returned local item:', err);
    return newEntry;
  }
}

/**
 * Updates an existing project entry.
 */
export async function updateProject(
  id: string,
  updates: Partial<ContentEntry>
): Promise<ContentEntry> {
  const localList = getLocalCachedProjects();
  const existing = localList.find((p) => p.id === id) || DEFAULT_PROJECT_ENTRIES.find((p) => p.id === id);

  if (!existing) {
    throw new Error(`Project with ID "${id}" not found.`);
  }

  const updatedEntry: ContentEntry = {
    ...existing,
    ...updates,
    id: existing.id,
    updated_at: new Date().toISOString(),
    published_at:
      updates.status === 'published' && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at,
  };

  const updatedList = localList.map((p) => (p.id === id ? updatedEntry : p));
  saveLocalCachedProjects(updatedList);

  if (!isSupabaseConfigured) {
    return updatedEntry;
  }

  try {
    const { data, error } = await supabase
      .from('content_entries')
      .update({
        slug: updatedEntry.slug,
        route: updatedEntry.route,
        title: updatedEntry.title,
        summary: updatedEntry.summary,
        category: updatedEntry.category,
        role: updatedEntry.role,
        status: updatedEntry.status,
        render_mode: updatedEntry.render_mode,
        legacy_key: updatedEntry.legacy_key,
        template_key: updatedEntry.template_key,
        featured: updatedEntry.featured,
        sort_order: updatedEntry.sort_order,
        graph_config: updatedEntry.graph_config,
        seo: updatedEntry.seo,
        draft_document: updatedEntry.draft_document,
        published_document: updatedEntry.published_document,
        published_at: updatedEntry.published_at,
        updated_at: updatedEntry.updated_at,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('[projectRepository] Supabase update warning, saved locally:', error.message);
      return updatedEntry;
    }

    if (data) {
      const result: ContentEntry = {
        ...(data as unknown as ContentEntry),
        title: typeof data.title === 'string' ? { en: data.title, vi: data.title } : data.title,
        summary: typeof data.summary === 'string' ? { en: data.summary, vi: data.summary } : data.summary,
      };
      saveLocalCachedProjects(localList.map((p) => (p.id === id ? result : p)));
      return result;
    }

    return updatedEntry;
  } catch (err) {
    console.warn('[projectRepository] Supabase update failed, returned local item:', err);
    return updatedEntry;
  }
}

/**
 * Deletes or archives a project entry.
 */
export async function deleteProject(id: string): Promise<boolean> {
  const localList = getLocalCachedProjects();
  const updatedList = localList.filter((p) => p.id !== id);
  saveLocalCachedProjects(updatedList);

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('content_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[projectRepository] Supabase delete warning:', error.message);
      return true;
    }

    return true;
  } catch (err) {
    console.warn('[projectRepository] Supabase delete failed, removed locally:', err);
    return true;
  }
}
