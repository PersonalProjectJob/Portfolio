import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectNode } from './projectGraph.types';
import { mobileGroupOrder } from './projectGraph.config';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';

interface ProjectGraphMobileProps {
  nodes: ProjectNode[];
  onSelectNode: (id: string) => void;
}

export const ProjectGraphMobile: React.FC<ProjectGraphMobileProps> = ({ nodes, onSelectNode }) => {
  const { isLightMode } = useStore();
  const t = useT();

  // Group nodes
  const groupedNodes = mobileGroupOrder
    .filter(group => group !== 'identity') // Hide identity card on mobile
    .map(group => {
      return {
        group,
        items: nodes.filter(n => n.group === group).sort((a, b) => (a.sequence || 99) - (b.sequence || 99))
      };
    })
    .filter(g => g.items.length > 0);

  const getGroupName = (group: string) => {
    const keys: Record<string, string> = {
      identity: 'graph.group.identity',
      foundation: 'graph.group.foundation',
      product: 'graph.group.product',
      process: 'graph.group.process',
      automation: 'graph.group.automation'
    };
    return keys[group] ? t(keys[group]) : group;
  };

  return (
    <>
      {/* Content Scroll Area */}
      <div className="md:hidden absolute inset-0 top-[124px] overflow-y-auto px-4 pb-40">
        <div className="max-w-md mx-auto flex flex-col gap-6 relative z-10">
        {groupedNodes.map((section, sectionIdx) => (
          <div 
            key={section.group} 
            className={`flex flex-col rounded-3xl border overflow-hidden shadow-sm ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-700/60 backdrop-blur-md'
            }`}
          >
            <div className={`px-5 py-4 border-b ${isLightMode ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-800/30 border-slate-700/50'}`}>
              <h3 className={`text-[11px] font-black tracking-widest uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {getGroupName(section.group)}
              </h3>
            </div>
            
            <div className="flex flex-col">
              {section.items.map((node, i) => (
                <motion.button
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (sectionIdx * 3 + i) * 0.05, duration: 0.3 }}
                  onClick={() => {
                    if (node.href) onSelectNode(node.id);
                  }}
                  disabled={!node.href}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors border-b last:border-b-0 ${node.href ? 'cursor-pointer' : 'cursor-default'} ${
                    isLightMode
                      ? `border-slate-100 ${node.href ? 'hover:bg-slate-50 active:bg-slate-100' : ''}`
                      : `border-slate-700/50 ${node.href ? 'hover:bg-slate-800/40 active:bg-slate-800/60' : ''}`
                  }`}
                >
                  {/* Badge/Number */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black ${section.group === 'automation' ? 'text-sm' : 'text-base'} ${
                    node.importance === 'primary'
                      ? (isLightMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900')
                      : (isLightMode ? 'bg-orange-50 text-orange-600' : 'bg-orange-500/10 text-orange-400')
                  }`}>
                    {section.group === 'automation' ? `0${i + 1}` : (node.shortTitle ? node.shortTitle.charAt(0) : '✦')}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-extrabold text-sm truncate ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                      {node.shortTitle || t(node.title)}
                    </p>
                    <p className={`text-[11px] font-bold tracking-wide mt-0.5 truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {node.note?.eyebrow ? t(node.note.eyebrow) : t(node.description)}
                    </p>
                  </div>

                  {/* Arrow if clickable */}
                  {node.href && (
                    <svg className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
