import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Grid,
  List,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  FileText,
  Video,
  X,
  Loader2,
  Info,
} from 'lucide-react';
import { useMediaAssets } from '../../cms/hooks/useMediaAssets';
import type { MediaAsset, LocalizedString } from '../../cms/types/cms.types';

type MediaFilterType = 'all' | 'image' | 'document' | 'video';
type ViewMode = 'grid' | 'list';

const FOLDERS = ['general', 'case-studies', 'profile', 'documents', 'backgrounds'];

export const AdminMedia: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    assets,
    isLoading,
    isError,
    uploadAsset,
    isUploading,
    deleteAsset,
    isDeleting,
    updateAltText,
    isUpdatingAlt,
  } = useMediaAssets(searchQuery);

  const [activeFilter, setActiveFilter] = useState<MediaFilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<MediaAsset | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>('general');
  const [uploadAltEn, setUploadAltEn] = useState<string>('');
  const [uploadAltVi, setUploadAltVi] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Modal Alt Text Edit State
  const [editingAltEn, setEditingAltEn] = useState<string>('');
  const [editingAltVi, setEditingAltVi] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyUrl = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    showToast('CDN URL copied to clipboard!', 'success');
  };

  // Open asset detail modal
  const openDetailModal = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setEditingAltEn(asset.alt_text?.en || '');
    setEditingAltVi(asset.alt_text?.vi || '');
  };

  // Filtered assets by type
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'image') return asset.mime_type?.startsWith('image/');
      if (activeFilter === 'document') return asset.mime_type?.includes('pdf') || asset.file_name.endsWith('.pdf');
      if (activeFilter === 'video') return asset.mime_type?.startsWith('video/');
      return true;
    });
  }, [assets, activeFilter]);

  // Compute total size
  const totalSizeBytes = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
  }, [assets]);

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadAltEn(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      setUploadAltVi(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      setIsUploadModalOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadAltEn(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      setUploadAltVi(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      setIsUploadModalOpen(true);
    }
  };

  // Perform upload
  const handlePerformUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploadProgress(20);
      const interval = setInterval(() => {
        setUploadProgress((p) => (p === null || p >= 85 ? p : p + 20));
      }, 120);

      const alt: LocalizedString = {
        en: uploadAltEn.trim() || uploadFile.name,
        vi: uploadAltVi.trim() || uploadFile.name,
      };

      await uploadAsset({
        file: uploadFile,
        folder: uploadFolder,
        altText: alt,
      });

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadProgress(null);
        setUploadAltEn('');
        setUploadAltVi('');
        showToast('Asset uploaded successfully!', 'success');
      }, 400);
    } catch (err: unknown) {
      setUploadProgress(null);
      const msg = err instanceof Error ? err.message : 'Failed to upload asset';
      showToast(msg, 'error');
    }
  };

  // Perform delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmAsset) return;
    try {
      await deleteAsset({
        id: deleteConfirmAsset.id,
        storagePath: deleteConfirmAsset.storage_path,
      });
      if (selectedAsset?.id === deleteConfirmAsset.id) {
        setSelectedAsset(null);
      }
      setDeleteConfirmAsset(null);
      showToast('Asset deleted successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete asset';
      showToast(msg, 'error');
    }
  };

  // Save updated alt text
  const handleSaveAltText = async () => {
    if (!selectedAsset) return;
    try {
      const updated = await updateAltText({
        id: selectedAsset.id,
        altText: {
          en: editingAltEn.trim(),
          vi: editingAltVi.trim(),
        },
      });
      if (updated) {
        setSelectedAsset(updated);
      }
      showToast('Alt text updated successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update alt text';
      showToast(msg, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6 max-w-7xl mx-auto pb-16"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xl border ${
              toastType === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-950/50'
            }`}
          >
            {toastType === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <Info className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Media Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supabase Storage CDN. Store, optimize, and organize visual assets for case studies and interactive embeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Assets
          </span>
          <span className="text-xl font-bold text-white mt-1 block font-mono">
            {assets.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Storage Used
          </span>
          <span className="text-xl font-bold text-teal-400 mt-1 block font-mono">
            {formatFileSize(totalSizeBytes)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Bucket
          </span>
          <span className="text-xs font-semibold text-slate-300 mt-2 block truncate font-mono">
            portfolio-assets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Edge CDN
          </span>
          <span className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/10'
            : 'border-slate-800 hover:border-teal-500/50 bg-slate-900/40'
        } p-8 text-center transition-all cursor-pointer`}
      >
        <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Drag and drop images, videos, or PDFs</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Supports PNG, WebP, SVG, JPG, MP4, and PDF up to 25MB. Files are immediately processed and accessible via Edge CDN.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl">
        {/* Left Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {(
            [
              { id: 'all', label: 'All Files' },
              { id: 'image', label: 'Images' },
              { id: 'document', label: 'Documents' },
              { id: 'video', label: 'Videos' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Right Search and View Mode Switch */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="min-h-[300px] w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading Media Library...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          Failed to fetch media assets from Supabase Storage. Using local cache.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredAssets.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No media assets found</h4>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try changing your search query.' : 'Upload your first image, video, or PDF asset.'}
          </p>
        </div>
      )}

      {/* ─── Grid View ─── */}
      {!isLoading && viewMode === 'grid' && filteredAssets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const isImage = asset.mime_type?.startsWith('image/');
            const isVideo = asset.mime_type?.startsWith('video/');
            const isPdf = asset.mime_type?.includes('pdf') || asset.file_name.endsWith('.pdf');

            return (
              <motion.div
                key={asset.id}
                whileHover={{ y: -2 }}
                onClick={() => openDetailModal(asset)}
                className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-teal-500/40 transition-all shadow-md"
              >
                {/* Thumbnail container */}
                <div className="h-36 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text?.en || asset.file_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/og-product-figma.jpg';
                      }}
                    />
                  ) : isPdf ? (
                    <div className="flex flex-col items-center gap-1.5 text-rose-400">
                      <FileText className="w-10 h-10" />
                      <span className="text-[10px] font-mono font-semibold uppercase">PDF</span>
                    </div>
                  ) : isVideo ? (
                    <div className="flex flex-col items-center gap-1.5 text-amber-400">
                      <Video className="w-10 h-10" />
                      <span className="text-[10px] font-mono font-semibold uppercase">Video</span>
                    </div>
                  ) : (
                    <FileText className="w-10 h-10 text-slate-500" />
                  )}

                  {/* Quick Copy Link Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyUrl(asset.public_url, e)}
                      className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition-transform hover:scale-105"
                      title="Copy Public CDN URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmAsset(asset);
                      }}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform hover:scale-105"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer label */}
                <div className="p-3 space-y-1">
                  <span className="text-xs font-semibold text-white truncate block" title={asset.file_name}>
                    {asset.file_name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatFileSize(asset.file_size)}</span>
                    {asset.width && asset.height && (
                      <span>{asset.width}&times;{asset.height}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── List View ─── */}
      {!isLoading && viewMode === 'list' && filteredAssets.length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl overflow-hidden divide-y divide-slate-800/60">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => openDetailModal(asset)}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {asset.mime_type?.startsWith('image/') ? (
                    <img
                      src={asset.public_url}
                      alt={asset.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : asset.mime_type?.includes('pdf') ? (
                    <FileText className="w-5 h-5 text-rose-400" />
                  ) : asset.mime_type?.startsWith('video/') ? (
                    <Video className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{asset.file_name}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {asset.alt_text?.en || asset.storage_path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-medium text-slate-300 block font-mono">
                    {formatFileSize(asset.file_size)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyUrl(asset.public_url, e)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy CDN URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmAsset(asset);
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL 1: Upload Modal ─── */}
      <AnimatePresence>
        {isUploadModalOpen && uploadFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isUploading) setIsUploadModalOpen(false);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-5 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-display">Upload Asset to CDN</h3>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File details */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white truncate block">{uploadFile.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(uploadFile.size)} &bull; {uploadFile.type || 'Unknown Type'}
                  </span>
                </div>
              </div>

              {/* Target Folder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Storage Directory
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDERS.map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setUploadFolder(folder)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        uploadFolder === folder
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bilingual Alt Text */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-teal-300 mb-1">
                    Alt Text (English)
                  </label>
                  <input
                    type="text"
                    value={uploadAltEn}
                    onChange={(e) => setUploadAltEn(e.target.value)}
                    placeholder="Descriptive image label..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    Alt Text (Vietnamese)
                  </label>
                  <input
                    type="text"
                    value={uploadAltVi}
                    onChange={(e) => setUploadAltVi(e.target.value)}
                    placeholder="Mô tả hình ảnh..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-teal-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePerformUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-950 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Confirm Upload</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: Asset Detail Modal ─── */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row overflow-hidden shadow-2xl z-10"
            >
              {/* Left Preview Pane */}
              <div className="lg:w-3/5 bg-slate-950 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-slate-800 min-h-[260px] relative">
                {selectedAsset.mime_type?.startsWith('image/') ? (
                  <img
                    src={selectedAsset.public_url}
                    alt={selectedAsset.file_name}
                    className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-lg"
                  />
                ) : selectedAsset.mime_type?.startsWith('video/') ? (
                  <video
                    src={selectedAsset.public_url}
                    controls
                    className="max-h-[50vh] max-w-full rounded-xl"
                  />
                ) : selectedAsset.mime_type?.includes('pdf') ? (
                  <div className="text-center space-y-3">
                    <FileText className="w-16 h-16 text-rose-400 mx-auto" />
                    <span className="text-xs font-semibold text-white block">
                      {selectedAsset.file_name}
                    </span>
                    <a
                      href={selectedAsset.public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-teal-300 text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open PDF in New Tab</span>
                    </a>
                  </div>
                ) : (
                  <FileText className="w-16 h-16 text-slate-500" />
                )}
              </div>

              {/* Right Metadata & Editor Pane */}
              <div className="lg:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px] lg:max-h-[80vh] custom-scrollbar space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white font-display truncate">
                      {selectedAsset.file_name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata Specs */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>File Size:</span>
                      <span className="text-white font-mono">{formatFileSize(selectedAsset.file_size)}</span>
                    </div>

                    {selectedAsset.width && selectedAsset.height && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Dimensions:</span>
                        <span className="text-white font-mono">
                          {selectedAsset.width} &times; {selectedAsset.height} px
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400">
                      <span>MIME Type:</span>
                      <span className="text-white font-mono">{selectedAsset.mime_type || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Created At:</span>
                      <span className="text-white font-mono">
                        {selectedAsset.created_at
                          ? new Date(selectedAsset.created_at).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Public URL Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">Public CDN URL</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedAsset.public_url}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-teal-300 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(selectedAsset.public_url)}
                        className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Localized Alt Text Editor */}
                  <div className="mt-4 space-y-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 font-display">
                      Accessibility & SEO Alt Text
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-teal-300 mb-1">
                        Alt Text (English)
                      </label>
                      <input
                        type="text"
                        value={editingAltEn}
                        onChange={(e) => setEditingAltEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Alt Text (Vietnamese)
                      </label>
                      <input
                        type="text"
                        value={editingAltVi}
                        onChange={(e) => setEditingAltVi(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAltText}
                      disabled={isUpdatingAlt}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isUpdatingAlt ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                      )}
                      <span>Save Alt Text</span>
                    </button>
                  </div>
                </div>

                {/* Footer Delete Button */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmAsset(selectedAsset);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Asset from Storage</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isDeleting) setDeleteConfirmAsset(null);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">Delete Media Asset?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete <span className="text-white font-semibold font-mono">{deleteConfirmAsset.file_name}</span>? This will permanently remove the file from Supabase Storage and invalidate existing CDN cache.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmAsset(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950 transition-all cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
