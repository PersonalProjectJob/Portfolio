import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { ContentEntry } from '../types/cms.types';
import { updateProject } from './projectRepository';

export interface ContentVersion {
  id: string;
  entry_id: string;
  version: number;
  snapshot: Partial<ContentEntry>;
  publish_note?: string | null;
  published_at: string;
  created_by?: string | null;
}

const STORAGE_KEY_PREFIX = 'portfolio_versions_';
const inMemoryVersionsMap: Record<string, ContentVersion[]> = {};

/**
 * Reads local cached versions for a specific project entry.
 */
export function getLocalCachedVersions(entryId: string): ContentVersion[] {
  if (!entryId) return [];
  if (typeof window === 'undefined') return inMemoryVersionsMap[entryId] || [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${entryId}`);
    if (!raw) return inMemoryVersionsMap[entryId] || [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[versionRepository] Failed to read local versions cache:', err);
    return inMemoryVersionsMap[entryId] || [];
  }
}

/**
 * Persists versions list to local storage.
 */
export function saveLocalCachedVersions(entryId: string, versions: ContentVersion[]): void {
  if (!entryId) return;
  inMemoryVersionsMap[entryId] = [...versions];
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${entryId}`, JSON.stringify(versions));
  } catch (err) {
    console.warn('[versionRepository] Failed to save local versions cache:', err);
  }
}

/**
 * Fetches all version snapshots for a given project entry, ordered by version descending.
 */
export async function fetchProjectVersions(entryId: string): Promise<ContentVersion[]> {
  if (!entryId) return [];
  const localVersions = getLocalCachedVersions(entryId);

  if (!isSupabaseConfigured) {
    return localVersions.sort((a, b) => b.version - a.version);
  }

  try {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('entry_id', entryId)
      .order('version', { ascending: false });

    if (error) {
      console.warn('[versionRepository] Supabase fetch error, fallback to local:', error.message);
      return localVersions.sort((a, b) => b.version - a.version);
    }

    if (data && Array.isArray(data)) {
      const formatted: ContentVersion[] = data.map((v) => ({
        id: v.id,
        entry_id: v.entry_id,
        version: v.version,
        snapshot: typeof v.snapshot === 'string' ? JSON.parse(v.snapshot) : v.snapshot,
        publish_note: v.publish_note,
        published_at: v.published_at,
        created_by: v.created_by,
      }));
      saveLocalCachedVersions(entryId, formatted);
      return formatted;
    }

    return localVersions;
  } catch (err) {
    console.warn('[versionRepository] Error fetching versions from Supabase:', err);
    return localVersions;
  }
}

/**
 * Creates a new immutable version snapshot and publishes the project entry.
 */
export async function createVersionSnapshot(
  entryId: string,
  snapshot: Partial<ContentEntry>,
  publishNote?: string
): Promise<ContentVersion> {
  const timestamp = new Date().toISOString();
  const existingVersions = await fetchProjectVersions(entryId);
  const nextVersionNumber = existingVersions.length > 0
    ? Math.max(...existingVersions.map((v) => v.version)) + 1
    : 1;

  const versionId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // Create clean snapshot payload
  const snapshotData: Partial<ContentEntry> = {
    ...snapshot,
    status: 'published',
    published_at: timestamp,
    updated_at: timestamp,
  };

  const newVersion: ContentVersion = {
    id: versionId,
    entry_id: entryId,
    version: nextVersionNumber,
    snapshot: snapshotData,
    publish_note: publishNote || `Published v${nextVersionNumber}`,
    published_at: timestamp,
    created_by: null,
  };

  // Update local cache
  const updatedLocal = [newVersion, ...existingVersions.filter((v) => v.id !== versionId)];
  saveLocalCachedVersions(entryId, updatedLocal);

  // Update the project entry status and published_document
  await updateProject(entryId, {
    status: 'published',
    published_document: snapshot.draft_document || snapshot.published_document,
    published_at: timestamp,
    title: snapshot.title,
    summary: snapshot.summary,
    category: snapshot.category,
    role: snapshot.role,
    slug: snapshot.slug,
    route: snapshot.route,
    featured: snapshot.featured,
    seo: snapshot.seo,
  });

  if (!isSupabaseConfigured) {
    return newVersion;
  }

  try {
    const { data, error } = await supabase
      .from('content_versions')
      .insert({
        id: newVersion.id,
        entry_id: newVersion.entry_id,
        version: newVersion.version,
        snapshot: newVersion.snapshot,
        publish_note: newVersion.publish_note,
        published_at: newVersion.published_at,
      })
      .select()
      .single();

    if (error) {
      console.warn('[versionRepository] Supabase insert error, saved locally:', error.message);
      return newVersion;
    }

    if (data) {
      const formatted: ContentVersion = {
        id: data.id,
        entry_id: data.entry_id,
        version: data.version,
        snapshot: typeof data.snapshot === 'string' ? JSON.parse(data.snapshot) : data.snapshot,
        publish_note: data.publish_note,
        published_at: data.published_at,
        created_by: data.created_by,
      };
      return formatted;
    }

    return newVersion;
  } catch (err) {
    console.warn('[versionRepository] Supabase snapshot creation failed, using local item:', err);
    return newVersion;
  }
}

/**
 * Rolls back a project entry to a previous version snapshot.
 */
export async function rollbackToVersion(
  entryId: string,
  versionId: string
): Promise<ContentEntry> {
  const versions = await fetchProjectVersions(entryId);
  const targetVersion = versions.find((v) => v.id === versionId);

  if (!targetVersion) {
    throw new Error(`Version snapshot with ID "${versionId}" not found.`);
  }

  const snapshot = targetVersion.snapshot;

  // Restore project data from snapshot
  const restored = await updateProject(entryId, {
    title: snapshot.title,
    summary: snapshot.summary,
    category: snapshot.category,
    role: snapshot.role,
    slug: snapshot.slug,
    route: snapshot.route,
    status: snapshot.status || 'published',
    featured: snapshot.featured,
    seo: snapshot.seo,
    draft_document: snapshot.draft_document || snapshot.published_document,
    published_document: snapshot.published_document,
  });

  return restored;
}
