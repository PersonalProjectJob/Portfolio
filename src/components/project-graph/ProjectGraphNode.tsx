import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectNode } from './projectGraph.types';
import { ProjectGraphNote } from './ProjectGraphNote';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';

interface ProjectGraphNodeProps {
  node: ProjectNode;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ProjectGraphNode: React.FC<ProjectGraphNodeProps> = ({
  node,
  isActive,
  onSelect,
}) => {
  const { isLightMode } = useStore();
  const t = useT();

  const showNote = isActive; // Condition 8, 9: only one active at a time, we will rely on isActive for note

  // Premium Glassmorphism styling instead of standard flat colors
  const baseBg = isLightMode 
    ? 'bg-white/70 backdrop-blur-xl' 
    : 'bg-[#0a0f1c]/40 backdrop-blur-xl';
  const baseBorder = isLightMode 
    ? 'border-white/50' 
    : 'border-white/10';
  const hoverBorder = isLightMode 
    ? 'group-hover:border-orange-400/50 group-hover:bg-white/90' 
    : 'group-hover:border-orange-500/30 group-hover:bg-[#0a0f1c]/60';
  const activeBorder = isLightMode 
    ? 'border-orange-500 bg-white' 
    : 'border-orange-500 bg-[#0a0f1c]/80';
  
  // Primary node (Profile) might have different styling
  const textClass = isActive 
    ? (isLightMode ? 'text-orange-600' : 'text-orange-400')
    : (isLightMode ? 'text-slate-700' : 'text-slate-300');

  const currentBorder = isActive ? activeBorder : `${baseBorder} ${hoverBorder}`;
  const shadowClass = isActive 
    ? (isLightMode ? 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_30px_rgba(249,115,22,0.4)]')
    : 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]';

  const shortName = node.shortTitle || t(node.title);

  return (
    <div
      className="absolute group z-20"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(node.id)}
        aria-label={`Project: ${t(node.title)}`}
        className={`whitespace-nowrap px-4 py-2 md:px-5 md:py-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer border-[1px] transition-all premium-card ${baseBg} ${currentBorder} ${shadowClass}`}
      >
        <span className={`font-extrabold uppercase tracking-widest text-[10px] md:text-[11px] transition-colors ${textClass}`}>
          {shortName}
        </span>
      </motion.button>

      {/* Note tooltip */}
      <ProjectGraphNote
        nodeId={node.id}
        title={node.note?.title ? t(node.note.title) : undefined}
        description={node.note?.description ? t(node.note.description) : undefined}
        eyebrow={node.note?.eyebrow}
        anchor={node.note?.preferredAnchor}
        offset={node.note?.offset}
        isVisible={showNote}
        onExplore={node.href ? () => onSelect(node.id) : undefined}
      />
    </div>
  );
};
