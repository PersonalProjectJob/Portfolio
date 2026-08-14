import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  Moon,
  Wifi,
  Battery,
} from 'lucide-react';
import type { ContentBlock, ContentEntry } from '../../cms/types/cms.types';
import { DynamicCaseStudyRenderer } from '../../cms/renderers/DynamicCaseStudyRenderer';
import { CustomSelect } from './CustomSelect';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ZoomLevel = 50 | 75 | 100 | 'fit';

export interface LivePreviewCanvasProps {
  project?: Partial<ContentEntry>;
  blocks: ContentBlock[];
  language?: 'en' | 'vi';
  onLanguageChange?: (lang: 'en' | 'vi') => void;
  className?: string;
}

export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = ({
  project = {},
  blocks,
  language: parentLang = 'en',
  onLanguageChange,
  className = '',
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [internalLang, setInternalLang] = useState<'en' | 'vi'>(parentLang);
  const [isPreviewLightMode, setIsPreviewLightMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  // Sync external language changes
  useEffect(() => {
    setInternalLang(parentLang);
  }, [parentLang]);

  const activeLang = onLanguageChange ? parentLang : internalLang;

  const handleLangToggle = (newLang: 'en' | 'vi') => {
    setInternalLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  // Compute fit-to-screen scale factor
  useEffect(() => {
    const updateFitScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      let targetWidth = 1240;
      if (viewport === 'tablet') targetWidth = 768;
      if (viewport === 'mobile') targetWidth = 390;

      if (containerWidth < targetWidth) {
        const factor = Math.max(0.35, Math.min(1, containerWidth / targetWidth));
        setFitScale(Number(factor.toFixed(2)));
      } else {
        setFitScale(1);
      }
    };

    updateFitScale();
    window.addEventListener('resize', updateFitScale);
    return () => window.removeEventListener('resize', updateFitScale);
  }, [viewport, zoom]);

  // Determine actual numerical CSS scale
  const getScaleValue = (): number => {
    if (zoom === 'fit') return fitScale;
    return zoom / 100;
  };

  const scaleValue = getScaleValue();

  // Reset preview scroll position
  const handleReset = () => {
    setKeyCounter((prev) => prev + 1);
  };

  const displaySlug = project.slug || 'next-gen-fintech';

  return (
    <div
      className={`relative flex flex-col h-full w-full bg-[#05070e] overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl'
      } ${className}`}
    >
      {/* ─── Framer-Style Floating Header Controls Bar ─── */}
      <div className="h-14 shrink-0 px-4 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 z-30 select-none">
        
        {/* Left: Viewport Switcher (Desktop / Tablet / Mobile) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/90 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Desktop Viewport (1240px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Tablet Viewport (768px iPad)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Mobile Viewport (390px iPhone)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Live Canvas Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 text-xs font-medium text-slate-300 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Framer Live Canvas</span>
          <span className="text-slate-600">&bull;</span>
          <span className="font-mono text-teal-400 text-[11px]">{blocks.length} Blocks</span>
        </div>

        {/* Right: Controls (Theme, Language, Zoom, Reset, Fullscreen) */}
        <div className="flex items-center gap-2">
          
          {/* Light / Dark Preview Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewLightMode(!isPreviewLightMode)}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 rounded-xl transition-colors cursor-pointer"
            title={isPreviewLightMode ? 'Switch Preview to Dark Theme' : 'Switch Preview to Light Theme'}
          >
            {isPreviewLightMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-teal-400" />}
          </button>

          {/* Language Toggle */}
          <div className="flex items-center p-0.5 bg-slate-900/90 border border-slate-800/90 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => handleLangToggle('en')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLangToggle('vi')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeLang === 'vi'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VI
            </button>
          </div>

          {/* Zoom / Scale Selector */}
          <div className="w-24">
            <CustomSelect
              value={String(zoom)}
              onChange={(val) => setZoom(val === 'fit' ? 'fit' : Number(val) as ZoomLevel)}
              options={[
                { value: '50', label: '50%' },
                { value: '75', label: '75%' },
                { value: '100', label: '100%' },
                { value: 'fit', label: 'Fit' },
              ]}
              size="sm"
            />
          </div>

          {/* Refresh / Reset Canvas */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 rounded-xl transition-colors cursor-pointer"
            title="Reset Canvas Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 rounded-xl transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Canvas Workspace Area (Dotted Blueprint Grid Surface) ─── */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full overflow-auto p-4 sm:p-10 flex items-start justify-center bg-[#070a12] [background-image:radial-gradient(rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
      >
        <motion.div
          layout
          style={{
            transform: `scale(${scaleValue})`,
            transformOrigin: 'top center',
            transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="my-auto transition-all duration-300"
        >
          {/* ═══════════════════════════════════════════════════════════════
              1. DESKTOP VIEWPORT FRAME (Framer / macOS Window Bezel)
             ═══════════════════════════════════════════════════════════════ */}
          {viewport === 'desktop' && (
            <div className="w-full max-w-[1240px] min-w-[320px] rounded-3xl border border-slate-800/90 bg-[#050811] shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden ring-1 ring-white/5">
              
              {/* macOS Window Title Bar Header Chrome */}
              <div className="h-11 px-5 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 border-b border-slate-800/80 flex items-center justify-between gap-4 select-none">
                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-sm" />
                </div>

                {/* Centered Address Bar Pill */}
                <div className="flex-1 max-w-md px-4 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 text-center truncate flex items-center justify-center gap-2 shadow-inner">
                  <span className="text-slate-600">https://</span>
                  <span className="text-slate-300 font-medium">tnsthao94.online/project/{displaySlug}</span>
                </div>

                {/* Zoom percentage tag */}
                <div className="w-16 text-right">
                  <span className="text-[11px] text-teal-400 font-mono font-semibold">100%</span>
                </div>
              </div>

              {/* Dynamic Renderer Body */}
              <div
                key={`desktop-${keyCounter}`}
                className={`w-full max-h-[82vh] overflow-y-auto ${
                  isPreviewLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#050811] text-slate-100'
                }`}
              >
                <DynamicCaseStudyRenderer
                  project={project}
                  blocks={blocks}
                  lang={activeLang}
                  isLivePreview={true}
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              2. TABLET VIEWPORT FRAME (iPad 768px Chassis with Camera)
             ═══════════════════════════════════════════════════════════════ */}
          {viewport === 'tablet' && (
            <div className="w-[768px] rounded-[40px] border-[14px] border-slate-900 bg-[#050811] shadow-[0_35px_100px_rgba(0,0,0,0.9)] overflow-hidden relative ring-1 ring-slate-700/60">
              
              {/* iPad Top Bezel with Front Camera & Ambient Sensor */}
              <div className="h-7 bg-slate-900 flex items-center justify-center gap-2 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-teal-500/60" />
                </div>
              </div>

              {/* Tablet Browser Header */}
              <div className="h-9 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-center select-none">
                <div className="max-w-xs w-full px-3 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 text-center truncate">
                  tnsthao94.online/project/{displaySlug}
                </div>
              </div>

              {/* Dynamic Renderer Body */}
              <div
                key={`tablet-${keyCounter}`}
                className={`w-full max-h-[76vh] overflow-y-auto ${
                  isPreviewLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#050811] text-slate-100'
                }`}
              >
                <DynamicCaseStudyRenderer
                  project={project}
                  blocks={blocks}
                  lang={activeLang}
                  isLivePreview={true}
                />
              </div>

              {/* iPad Bottom Bezel with Home Pill Indicator */}
              <div className="h-5 bg-slate-900 flex items-center justify-center">
                <div className="w-36 h-1.5 rounded-full bg-slate-700/80" />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3. MOBILE VIEWPORT FRAME (iPhone 390px with Dynamic Island)
             ═══════════════════════════════════════════════════════════════ */}
          {viewport === 'mobile' && (
            <div className="w-[390px] rounded-[52px] border-[12px] border-slate-900 bg-[#050811] shadow-[0_35px_110px_rgba(0,0,0,0.95)] overflow-hidden relative ring-1 ring-slate-700/70">
              
              {/* iPhone Dynamic Island & Status Bar */}
              <div className="h-11 bg-slate-900 flex items-center justify-between px-6 pt-1 select-none">
                {/* Clock */}
                <span className="text-[12px] font-semibold text-slate-200 font-mono tracking-tight">09:41</span>
                
                {/* Dynamic Island Capsule */}
                <div className="w-24 h-6 rounded-full bg-black border border-slate-800/80 flex items-center justify-between px-2.5 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-500/80" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                </div>

                {/* Status Icons: 5G & Battery */}
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  <Battery className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>

              {/* Mobile Browser Address Bar */}
              <div className="h-8 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-center select-none">
                <div className="max-w-[240px] w-full px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-400 text-center truncate">
                  tnsthao94.online/project/{displaySlug}
                </div>
              </div>

              {/* Dynamic Renderer Body */}
              <div
                key={`mobile-${keyCounter}`}
                className={`w-full max-h-[70vh] overflow-y-auto ${
                  isPreviewLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#050811] text-slate-100'
                }`}
              >
                <DynamicCaseStudyRenderer
                  project={project}
                  blocks={blocks}
                  lang={activeLang}
                  isLivePreview={true}
                />
              </div>

              {/* iPhone Bottom Home Swipe Bar */}
              <div className="h-7 bg-slate-900 flex items-center justify-center">
                <div className="w-32 h-1.5 rounded-full bg-slate-600 shadow-sm" />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LivePreviewCanvas;
