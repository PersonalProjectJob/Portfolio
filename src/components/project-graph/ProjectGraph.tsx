import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { projectNodes, projectEdges } from './projectGraph.data';
import { ProjectGraphCanvas } from './ProjectGraphCanvas';
import { ProjectGraphMobile } from './ProjectGraphMobile';
import { useStore, QUEST_STATE_MAP } from '../../store/useStore';
import type { GameState } from '../../store/useStore';

export const ProjectGraph: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>('profile');
  const { setGameState, handleQuestSelect } = useStore();

  const handleSelectNode = (id: string) => {
    setActiveNodeId(id);
    if (id === 'profile') return; // Do not navigate, just open note

    const node = projectNodes.find(n => n.id === id);
    if (node?.href) {
      if (node.href in QUEST_STATE_MAP) {
        handleQuestSelect(node.href);
      } else {
        if (import.meta.env?.DEV) {
          console.warn(`Warning: Node ${id} has unmapped href ${node.href}`);
        }
        setGameState(node.href as GameState);
      }
    } else {
      if (import.meta.env?.DEV) {
        console.warn(`Warning: Node ${id} does not have an href and cannot navigate.`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-10 overflow-hidden w-full h-full flex items-center justify-center"
    >
      <ProjectGraphCanvas
        nodes={projectNodes}
        edges={projectEdges}
        activeNodeId={activeNodeId}
        onSelectNode={handleSelectNode}
      />
      <ProjectGraphMobile
        nodes={projectNodes}
        onSelectNode={handleSelectNode}
      />
    </motion.div>
  );
};
