import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { MediaAsset, LocalizedString } from '../types/cms.types';

export const STORAGE_BUCKET = 'portfolio-assets';
const LOCAL_MEDIA_STORAGE_KEY = 'portfolio_media_assets_cache';

const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-001',
    file_name: 'avatar.jpg',
    storage_path: 'profile/avatar.jpg',
    public_url: '/avatar.jpg',
    mime_type: 'image/jpeg',
    file_size: 214315,
    width: 800,
    height: 800,
    alt_text: {
      en: 'Trương Nguyễn Sơn Thảo (Son Thao) - Profile Avatar',
      vi: 'Ảnh đại diện Trương Nguyễn Sơn Thảo (Son Thao)',
    },
    created_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'media-002',
    file_name: 'og-product-figma.jpg',
    storage_path: 'seo/og-product-figma.jpg',
    public_url: '/images/og-product-figma.jpg',
    mime_type: 'image/jpeg',
    file_size: 177398,
    width: 1200,
    height: 630,
    alt_text: {
      en: 'Figma Design System Preview OG Image',
      vi: 'Hình ảnh xem trước Design System trên Figma',
    },
    created_at: '2026-08-14T00:01:00Z',
  },
  {
    id: 'media-003',
    file_name: 'hero-bg.webp',
    storage_path: 'backgrounds/hero-bg.webp',
    public_url: '/hero-bg.webp',
    mime_type: 'image/webp',
    file_size: 45008,
    width: 1920,
    height: 1080,
    alt_text: {
      en: 'Hero Ambient Glassmorphism Background',
      vi: 'Ảnh nền Glassmorphism không gian làm việc',
    },
    created_at: '2026-08-14T00:02:00Z',
  },
  {
    id: 'media-004',
    file_name: 'Truong-Nguyen-Son-Thao-Product-Designer-CV.pdf',
    storage_path: 'documents/Truong-Nguyen-Son-Thao-Product-Designer-CV.pdf',
    public_url: '/cv/Truong-Nguyen-Son-Thao-Product-Designer-CV.pdf',
    mime_type: 'application/pdf',
    file_size: 1240000,
    width: null,
    height: null,
    alt_text: {
      en: 'Curriculum Vitae - Truong Nguyen Son Thao (Product Designer)',
      vi: 'Hồ sơ năng lực - Trương Nguyễn Sơn Thảo (Product Designer)',
    },
    created_at: '2026-08-14T00:03:00Z',
  },
];

/**
 * Get local cached media assets list
 */
export function getLocalMediaAssets(): MediaAsset[] {
  if (typeof window === 'undefined') return DEFAULT_MEDIA_ASSETS;
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_MEDIA_STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ASSETS));
      return DEFAULT_MEDIA_ASSETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MEDIA_ASSETS;
  } catch {
    return DEFAULT_MEDIA_ASSETS;
  }
}

/**
 * Save media assets to local storage cache
 */
export function saveLocalMediaAssets(assets: MediaAsset[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_MEDIA_STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.warn('[mediaRepository] Failed to cache media assets:', err);
  }
}

/**
 * Helper to inspect image dimensions in browser
 */
function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve({});
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({});
    };
    img.src = objectUrl;
  });
}

/**
 * Fetch all media assets ordered by created_at DESC with optional search query.
 */
export async function fetchMediaAssets(search?: string): Promise<MediaAsset[]> {
  const localList = getLocalMediaAssets();

  if (!isSupabaseConfigured) {
    if (!search || !search.trim()) return localList;
    const query = search.toLowerCase().trim();
    return localList.filter(
      (a) =>
        a.file_name.toLowerCase().includes(query) ||
        a.alt_text.en.toLowerCase().includes(query) ||
        a.alt_text.vi.toLowerCase().includes(query) ||
        (a.mime_type && a.mime_type.toLowerCase().includes(query))
    );
  }

  try {
    let queryBuilder = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (search && search.trim()) {
      queryBuilder = queryBuilder.ilike('file_name', `%${search.trim()}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.warn('[mediaRepository] Supabase fetch error, fallback to local cache:', error.message);
      return localList;
    }

    if (data && data.length > 0) {
      const formatted: MediaAsset[] = data.map((item: any) => ({
        id: item.id,
        file_name: item.file_name,
        storage_path: item.storage_path,
        public_url: item.public_url,
        mime_type: item.mime_type,
        file_size: item.file_size,
        width: item.width,
        height: item.height,
        alt_text: item.alt_text || { en: item.file_name, vi: item.file_name },
        created_at: item.created_at,
      }));
      saveLocalMediaAssets(formatted);
      return formatted;
    }

    return localList;
  } catch (err) {
    console.warn('[mediaRepository] Network error, fallback to local:', err);
    return localList;
  }
}

/**
 * Upload a media asset to Supabase Storage bucket and create a media_assets table record.
 */
export async function uploadMediaAsset(
  file: File,
  folder: string = 'general',
  altText?: LocalizedString
): Promise<MediaAsset> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`;
  const dimensions = await getImageDimensions(file);

  const finalAltText: LocalizedString = altText || {
    en: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    vi: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
  };

  // Mock / Offline upload path
  if (!isSupabaseConfigured) {
    const objectUrl = URL.createObjectURL(file);
    const mockAsset: MediaAsset = {
      id: `local-media-${timestamp}`,
      file_name: file.name,
      storage_path: storagePath,
      public_url: objectUrl,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      width: dimensions.width || null,
      height: dimensions.height || null,
      alt_text: finalAltText,
      created_at: new Date().toISOString(),
    };

    const current = getLocalMediaAssets();
    const updated = [mockAsset, ...current];
    saveLocalMediaAssets(updated);
    return mockAsset;
  }

  try {
    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[mediaRepository] Storage upload error:', uploadError.message);
      throw new Error(`Upload to storage failed: ${uploadError.message}`);
    }

    // 2. Get Public CDN URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // 3. Insert record into database
    const newRecord = {
      file_name: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      width: dimensions.width || null,
      height: dimensions.height || null,
      alt_text: finalAltText,
    };

    const { data: insertedData, error: dbError } = await supabase
      .from('media_assets')
      .insert(newRecord)
      .select()
      .single();

    if (dbError) {
      console.error('[mediaRepository] Database insert error:', dbError.message);
      // Construct fallback asset record with returned public url
      const fallbackAsset: MediaAsset = {
        id: `storage-id-${timestamp}`,
        ...newRecord,
        created_at: new Date().toISOString(),
      };
      const current = getLocalMediaAssets();
      saveLocalMediaAssets([fallbackAsset, ...current]);
      return fallbackAsset;
    }

    const createdAsset: MediaAsset = {
      id: insertedData.id,
      file_name: insertedData.file_name,
      storage_path: insertedData.storage_path,
      public_url: insertedData.public_url,
      mime_type: insertedData.mime_type,
      file_size: insertedData.file_size,
      width: insertedData.width,
      height: insertedData.height,
      alt_text: insertedData.alt_text as LocalizedString,
      created_at: insertedData.created_at,
    };

    const current = getLocalMediaAssets();
    saveLocalMediaAssets([createdAsset, ...current.filter((a) => a.id !== createdAsset.id)]);
    return createdAsset;
  } catch (err: unknown) {
    console.error('[mediaRepository] Upload process failed:', err);
    throw err;
  }
}

/**
 * Delete a media asset from Supabase storage bucket and database.
 */
export async function deleteMediaAsset(id: string, storagePath: string): Promise<boolean> {
  const current = getLocalMediaAssets();
  const updated = current.filter((a) => a.id !== id);
  saveLocalMediaAssets(updated);

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    // 1. Remove from Storage Bucket
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);
      if (storageError) {
        console.warn('[mediaRepository] Storage deletion warning:', storageError.message);
      }
    }

    // 2. Delete DB record
    const { error: dbError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.warn('[mediaRepository] DB deletion error:', dbError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[mediaRepository] Failed to delete asset:', err);
    return false;
  }
}

/**
 * Update localized alt text of an asset
 */
export async function updateMediaAssetAltText(
  id: string,
  altText: LocalizedString
): Promise<MediaAsset | null> {
  const current = getLocalMediaAssets();
  const target = current.find((a) => a.id === id);
  if (target) {
    target.alt_text = altText;
    saveLocalMediaAssets([...current]);
  }

  if (!isSupabaseConfigured) {
    return target || null;
  }

  try {
    const { data, error } = await supabase
      .from('media_assets')
      .update({ alt_text: altText })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return target || null;
    }

    return {
      id: data.id,
      file_name: data.file_name,
      storage_path: data.storage_path,
      public_url: data.public_url,
      mime_type: data.mime_type,
      file_size: data.file_size,
      width: data.width,
      height: data.height,
      alt_text: data.alt_text as LocalizedString,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error('[mediaRepository] Update alt text failed:', err);
    return target || null;
  }
}

/**
 * Upload an asset directly to Cloudinary CDN and cache it locally / in database.
 */
export async function uploadMediaAssetToCloudinary(
  file: File,
  folder: string = 'portfolio/assets',
  altText?: LocalizedString,
  onProgress?: (percent: number) => void
): Promise<MediaAsset> {
  const result = await uploadToCloudinary(file, { folder, onProgress });
  const dimensions = await getImageDimensions(file);

  const finalAltText: LocalizedString = altText || {
    en: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    vi: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
  };

  const newAsset: MediaAsset = {
    id: `cld-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    file_name: file.name,
    storage_path: result.public_id,
    public_url: result.secure_url || result.url,
    mime_type: file.type || 'application/octet-stream',
    file_size: result.bytes || file.size,
    width: dimensions.width || null,
    height: dimensions.height || null,
    alt_text: finalAltText,
    created_at: new Date().toISOString(),
  };

  const current = getLocalMediaAssets();
  saveLocalMediaAssets([newAsset, ...current]);
  return newAsset;
}

