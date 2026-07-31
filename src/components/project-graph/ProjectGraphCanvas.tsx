import React from 'react';
import type { ProjectNode, ProjectEdge } from './projectGraph.types';
import { ProjectGraphNode } from './ProjectGraphNode';
import { ProjectGraphEdge } from './ProjectGraphEdge';
import { ProjectGraphLightSequence } from './ProjectGraphLightSequence';
import { useStore } from '../../store/useStore';

interface ProjectGraphCanvasProps {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}

// Decorative component for Dark Mode to emphasize the Scorpio shape (Legs and Stinger) and the Night Sky
const ScorpioStars: React.FC = () => {
  const { isLightMode } = useStore();
  
  // Memoize random background stars to prevent re-generation on render
  // MEDIUM sparkle for background stars
  const backgroundStars = React.useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      r: Math.random() * 1.5 + 0.5,
      maxOpacity: Math.random() * 0.5 + 0.2, // up to 0.7
      dur: Math.random() * 4 + 2, // 2s to 6s twinkle
      delay: Math.random() * 5,
    }));
  }, []);

  if (isLightMode) return null;

  // Leg data: [startX, startY, jointX, jointY, endX, endY]
  const legs = [
    // Left legs
    [520, 410, 380, 400, 350, 430], // from Nexora
    [510, 550, 350, 540, 310, 570], // from Cryptomap
    [460, 680, 300, 670, 260, 710], // from Nailhub
    [360, 780, 220, 790, 180, 830], // from Vlinkpay
    // Right legs
    [520, 410, 660, 400, 700, 430], // from Nexora
    [510, 550, 670, 540, 710, 570], // from Cryptomap
    [460, 680, 630, 670, 670, 710], // from Nailhub
    [360, 780, 530, 790, 570, 830], // from Vlinkpay
    // Stinger extra curve (from sync-task-badge at 170, 510)
    [170, 510, 140, 470, 180, 430],
  ];

  return (
    <g className="pointer-events-none">
      {/* Background Night Sky Stars (Medium Sparkle) */}
      {backgroundStars.map((star, i) => (
        <circle key={`bg-${i}`} cx={star.x} cy={star.y} r={star.r} fill="#ffffff" opacity="0">
          <animate
            attributeName="opacity"
            values={`0; ${star.maxOpacity}; 0`}
            dur={`${star.dur}s`}
            begin={`${star.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Constellation Scorpio Legs & Stinger (Strong Sparkle) */}
      <g className="opacity-80">
        {legs.map((leg, i) => (
          <React.Fragment key={`leg-${i}`}>
            {/* Leg joint lines */}
            <path
              d={`M ${leg[0]} ${leg[1]} L ${leg[2]} ${leg[3]} L ${leg[4]} ${leg[5]}`}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Joint dot (Strong Twinkle) */}
            <circle cx={leg[2]} cy={leg[3]} r="2" fill="#ffffff" filter="drop-shadow(0 0 3px rgba(255,255,255,0.8))">
              <animate attributeName="r" values="1.5; 3.5; 1.5" dur="1.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2; 1; 0.2" dur="1.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </circle>
            {/* Tip dot (Intense Shining star) */}
            <circle cx={leg[4]} cy={leg[5]} r="3" fill="#ffffff" filter="drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 15px rgba(249,115,22,0.6))">
              <animate attributeName="r" values="2.5; 5; 2.5" dur="1.2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4; 1; 0.4" dur="1.2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </circle>
          </React.Fragment>
        ))}
      </g>
    </g>
  );
};

export const ProjectGraphCanvas: React.FC<ProjectGraphCanvasProps> = ({
  nodes,
  edges,
  activeNodeId,
  onSelectNode,
}) => {
  const { isLightMode } = useStore();

  // Mapping edge source/target to node positions for the SVG
  const edgesWithPos = React.useMemo(() => edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    return {
      ...edge,
      sourcePos: sourceNode ? { x: sourceNode.position.x * 1000, y: sourceNode.position.y * 1000 } : null,
      targetPos: targetNode ? { x: targetNode.position.x * 1000, y: targetNode.position.y * 1000 } : null,
    };
  }).filter(e => e.sourcePos && e.targetPos), [nodes, edges]);

  // Build continuous SVG paths for the light sequences to perfectly follow the beziers
  const { mainPathD, secondaryPathD } = React.useMemo(() => {
    const buildPathString = (nodeIds: string[]) => {
      if (nodeIds.length < 2) return '';
      let d = '';
      for (let i = 0; i < nodeIds.length - 1; i++) {
        const sourceId = nodeIds[i];
        const targetId = nodeIds[i + 1];
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        const edge = edges.find(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId));
        
        if (sourceNode && targetNode && edge) {
          const sourcePos = { x: sourceNode.position.x * 1000, y: sourceNode.position.y * 1000 };
          const targetPos = { x: targetNode.position.x * 1000, y: targetNode.position.y * 1000 };
          
          // Always draw from current sequence source to target
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          
          if (i === 0) {
            d += `M ${sourcePos.x} ${sourcePos.y} `;
          }
          
          if (edge.type === 'automation-sequence') {
            const cx = sourcePos.x + dx * 0.5 + dy * 0.1;
            const cy = sourcePos.y + dy * 0.5 - dx * 0.1;
            d += `Q ${cx} ${cy} ${targetPos.x} ${targetPos.y} `;
          } else {
            d += `L ${targetPos.x} ${targetPos.y} `;
          }
        }
      }
      return d.trim();
    };

    const mainSequenceIds = [
      'ai-process', 'profile', 'nexora', 'cryptomap', 'nailhub', 
      'vlinkpay', 'dispatch', 'agent-rules', 'sync-task-badge'
    ];
    const secondarySequenceIds = [
      'handoff', 'profile', 'nexora', 'cryptomap', 'nailhub', 
      'vlinkpay', 'dispatch', 'agent-rules', 'sync-task-badge'
    ];

    return {
      mainPathD: buildPathString(mainSequenceIds),
      secondaryPathD: buildPathString(secondarySequenceIds),
    };
  }, [nodes, edges]);

  return (
    <div className="relative w-full h-full max-w-[1200px] max-h-[900px] mx-auto hidden md:block">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isLightMode ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)"} strokeWidth="1"/>
            </pattern>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={isLightMode ? "rgba(15,23,42,0.4)" : "rgba(255,255,255,0.4)"} />
            </marker>
            <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="rgba(249,115,22,0.8)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* SVG Container for Edges */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        {edgesWithPos.map(edge => (
          <ProjectGraphEdge
            key={edge.id}
            edge={edge as ProjectEdge}
            sourcePos={edge.sourcePos!}
            targetPos={edge.targetPos!}
            isActive={activeNodeId === edge.source || activeNodeId === edge.target}
          />
        ))}
        {/* Decorative Scorpio Constellation Legs (Dark Mode Only) */}
        <ScorpioStars />
        {/* Animated Light Sequences */}
        <ProjectGraphLightSequence pathD={mainPathD} />
        <ProjectGraphLightSequence pathD={secondaryPathD} />
      </svg>

      {/* HTML Container for Nodes */}
      <div className="absolute inset-0 z-20">
        {nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.position.x * 100}%`,
              top: `${node.position.y * 100}%`,
            }}
          >
            <ProjectGraphNode
              node={node}
              isActive={activeNodeId === node.id}
              onSelect={onSelectNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
