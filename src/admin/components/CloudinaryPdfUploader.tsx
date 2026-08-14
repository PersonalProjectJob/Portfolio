import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  X,
  Link as LinkIcon,
  Cloud,
} from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export interface CloudinaryPdfUploaderProps {
  value: string;
  onChange: (url: string, fileMeta?: { name: string; size: number }) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export const CloudinaryPdfUploader: React.FC<CloudinaryPdfUploaderProps> = ({
  value,
  onChange,
  folder = 'portfolio/case-studies',
  label = 'PDF Document & Cloudinary Storage',
  helperText = 'Upload PDF presentation deck or CV document',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF document (.pdf).');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        folder,
        onProgress: (percent) => setUploadProgress(percent),
      });

      onChange(result.secure_url || result.url, {
        name: file.name,
        size: file.size,
      });

      setIsUploading(false);
      setUploadProgress(100);
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  const handleCopyUrl = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size nicely
  const getFileName = (url: string) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last);
    } catch {
      return url;
    }
  };

  const isCloudinaryUrl = value.includes('cloudinary.com') || value.startsWith('http');

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setIsManualInputOpen(!isManualInputOpen)}
          className="text-[11px] font-medium text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isManualInputOpen ? 'Hide URL input' : 'Edit URL manually'}</span>
        </button>
      </div>

      {/* Manual URL Input (Collapsible) */}
      <AnimatePresence>
        {isManualInputOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/... or /assets/...pdf"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500/50 text-xs font-mono text-amber-200 placeholder-slate-500 focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* State 1: Upload in Progress */}
      {isUploading && (
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col items-center justify-center gap-3 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="w-full max-w-xs space-y-1.5 text-center">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-200">
              <span>Uploading to Cloudinary CDN...</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-200 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* State 2: Active File / URL Configured */}
      {!isUploading && value && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 backdrop-blur-xl shadow-lg shadow-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* File Info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[260px] sm:max-w-sm">
                  {getFileName(value)}
                </span>
                {isCloudinaryUrl && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Cloudinary CDN
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                {value}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-2 text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
              title="Copy PDF URL"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* View PDF Button */}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
              title="Open PDF Preview in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Replace / Re-upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
              title="Upload New PDF"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Remove / Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer"
              title="Remove File"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* State 3: Empty Dropzone */}
      {!isUploading && !value && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'border-slate-800 hover:border-amber-500/40 bg-slate-950/50 hover:bg-slate-900/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-500/40 transition-all shadow-inner">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
              Click to browse or drag & drop PDF document here
            </p>
            <p className="text-[11px] text-slate-400">
              {helperText} &bull; Uploads automatically to Cloudinary CDN
            </p>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CloudinaryPdfUploader;
