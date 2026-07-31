import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { NodeAnchor } from './projectGraph.types';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';

interface ProjectGraphNoteProps {
  nodeId?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  anchor?: NodeAnchor;
  offset?: { x: number; y: number };
  isVisible: boolean;
  onExplore?: () => void;
}

export const ProjectGraphNote: React.FC<ProjectGraphNoteProps> = ({
  nodeId,
  title,
  description,
  eyebrow,
  anchor = 'right',
  offset = { x: 0, y: 0 },
  isVisible,
  onExplore,
}) => {
  const { isLightMode, setGameState } = useStore();
  const t = useT();
  const noteRef = useRef<HTMLDivElement>(null);
  const [clampedOffset, setClampedOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !noteRef.current) return;

    // MVP Clamping Logic:
    // Ensure the tooltip does not overflow the browser viewport
    const rect = noteRef.current.getBoundingClientRect();
    let dx = 0;
    let dy = 0;

    const padding = 16;
    if (rect.left < padding) dx = padding - rect.left;
    if (rect.right > window.innerWidth - padding) dx = window.innerWidth - padding - rect.right;
    if (rect.top < padding) dy = padding - rect.top;
    if (rect.bottom > window.innerHeight - padding) dy = window.innerHeight - padding - rect.bottom;

    if (dx !== 0 || dy !== 0) {
      setClampedOffset({ x: dx, y: dy });
    } else {
      setClampedOffset({ x: 0, y: 0 });
    }
  }, [isVisible, anchor]);

  const getAnchorClasses = () => {
    switch (anchor) {
      case 'left':
        return 'right-[calc(100%+16px)] top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-[calc(100%+16px)] top-1/2 -translate-y-1/2';
      case 'top':
        return 'bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2';
      case 'bottom':
      case 'auto':
      default:
        return 'top-[calc(100%+16px)] left-1/2 -translate-x-1/2';
    }
  };

  if (!title && !description) return null;

  return (
    <motion.div
      ref={noteRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95, pointerEvents: isVisible ? 'auto' : 'none' }}
      transition={{ duration: 0.2 }}
      className={`absolute z-50 w-64 p-4 rounded-xl shadow-2xl backdrop-blur-md border ${getAnchorClasses()} ${
        isLightMode
          ? 'bg-white/80 border-slate-200 shadow-slate-200/50'
          : 'bg-slate-900/90 border-slate-700/50 shadow-slate-950/80'
      }`}
      style={{
        marginLeft: offset.x + clampedOffset.x,
        marginTop: offset.y + clampedOffset.y,
      }}
    >
      {eyebrow && (
        <p className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ${isLightMode ? 'text-orange-600' : 'text-orange-400'}`}>
          {t(eyebrow)}
        </p>
      )}
      {title && (
        <h4 className={`text-base font-extrabold mb-1 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
          {title}
        </h4>
      )}
      {description && (
        <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
          {description}
        </p>
      )}
      {nodeId === 'profile' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGameState('SKILL_MATRIX');
          }}
          className={`mt-4 w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isLightMode
              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/40'
          }`}
        >
          {t('graph.viewSkillMatrix')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      ) : onExplore ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplore();
          }}
          className={`mt-4 w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isLightMode
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          {t('graph.viewCaseStudy')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      ) : null}
    </motion.div>
  );
};
