import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Sliders,
  Film,
} from 'lucide-react';
import type { MediaBlockData, MediaItem } from '../types';
import { resolveLocalizedString } from '../types';
import { useStore } from '../../../store/useStore';

export interface MediaBlockRendererProps {
  data: MediaBlockData;
  className?: string;
}

export const MediaBlockRenderer: React.FC<MediaBlockRendererProps> = ({
  data,
  className = '',
}) => {
  const { isLightMode, language } = useStore();

  const sectionTitle = resolveLocalizedString(data.sectionTitle, language);
  const description = resolveLocalizedString(data.description, language);
  const items = data.items || [];
  const comparison = data.comparisonSlider;

  // Lightbox State
  const [activeLightbox, setActiveLightbox] = useState<{ src: string; caption?: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard close for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLightbox) {
        setActiveLightbox(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightbox]);

  // Comparison slider mouse/touch drag handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    };
    const onPointerUp = () => {
      if (isDraggingSlider) {
        setIsDraggingSlider(false);
      }
    };

    if (isDraggingSlider) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Determine grid columns
  const getGridClass = () => {
    if (data.layout === 'grid-3' || items.length === 3 || items.length > 4) {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
    if (data.layout === 'grid-2' || items.length === 2 || items.length === 4) {
      return 'grid-cols-1 sm:grid-cols-2';
    }
    return 'grid-cols-1';
  };

  return (
    <section className={`relative w-full py-8 sm:py-12 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {(sectionTitle || description) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            {sectionTitle && (
              <h2 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                {sectionTitle}
              </h2>
            )}
            {description && (
              <p
                className={`font-['DM_Sans',sans-serif] text-base sm:text-lg ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {description}
              </p>
            )}
          </motion.div>
        )}

        {/* ─── Before / After Comparison Slider ─── */}
        {comparison?.enabled && comparison.beforeImage && comparison.afterImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Sliders className="w-4 h-4" />
              <span>
                {language === 'vi'
                  ? 'So sánh Trước / Sau (Kéo thanh trượt)'
                  : 'Before / After Comparison (Drag to Compare)'}
              </span>
            </div>

            <div
              ref={sliderContainerRef}
              onPointerDown={handlePointerDown}
              className={`relative h-[360px] sm:h-[480px] md:h-[540px] w-full rounded-3xl overflow-hidden select-none touch-none cursor-ew-resize border shadow-2xl ${
                isLightMode ? 'border-slate-200 shadow-slate-300/50' : 'border-slate-800 shadow-black/80'
              }`}
            >
              {/* After Image (Background) */}
              <img
                src={comparison.afterImage}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* After Label */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 pointer-events-none">
                {resolveLocalizedString(comparison.afterLabel, language) || 'After (Mới)'}
              </div>

              {/* Before Image (Clipped Overlay) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={comparison.beforeImage}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Before Label */}
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 pointer-events-none">
                  {resolveLocalizedString(comparison.beforeLabel, language) || 'Before (Cũ)'}
                </div>
              </div>

              {/* Vertical Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none -translate-x-1/2"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border-2 border-teal-500 font-bold text-xs">
                  &harr;
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Media Items Grid ─── */}
        {items.length > 0 && (
          <div className={`grid gap-6 ${getGridClass()}`}>
            {items.map((item: MediaItem, idx: number) => {
              const caption = resolveLocalizedString(item.caption, language);
              const isVideo = item.type === 'video' || item.url.endsWith('.mp4') || item.url.endsWith('.webm');

              return (
                <motion.figure
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="group flex flex-col"
                >
                  <div
                    onClick={() => {
                      if (!isVideo) {
                        setActiveLightbox({ src: item.url, caption });
                        setZoomLevel(1);
                      }
                    }}
                    className={`relative rounded-3xl overflow-hidden border transition-all duration-300 ${
                      isVideo ? '' : 'cursor-zoom-in'
                    } ${
                      isLightMode
                        ? 'bg-slate-100 border-slate-200/80 hover:border-teal-500/40 shadow-lg shadow-slate-200/50'
                        : 'bg-[#0f172a]/70 border-slate-800/80 hover:border-teal-500/40 shadow-xl shadow-black/40'
                    }`}
                  >
                    {isVideo ? (
                      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-teal-400">
                          <Film className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.url}
                          alt={item.alt || caption || 'Case study visual'}
                          loading="lazy"
                          className="w-full h-auto max-h-[520px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
                          <span className="text-xs text-white/90 font-medium line-clamp-1">
                            {caption}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                            <Maximize2 className="w-3 h-3" /> Zoom
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {caption && (
                    <figcaption
                      className={`mt-2.5 text-center text-xs sm:text-sm italic text-pretty ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {caption}
                    </figcaption>
                  )}
                </motion.figure>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Lightbox Modal ─── */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
            onClick={() => {
              setActiveLightbox(null);
              setZoomLevel(1);
            }}
          >
            {/* Toolbar */}
            <div
              className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-4 py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => {
                  setActiveLightbox(null);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors ml-2"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div
              className="max-w-6xl max-h-[80vh] overflow-auto p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={activeLightbox.src}
                alt={activeLightbox.caption || 'Enlarged preview'}
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {activeLightbox.caption && (
              <p className="mt-3 text-xs sm:text-sm text-slate-300 italic text-center max-w-xl">
                {activeLightbox.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
