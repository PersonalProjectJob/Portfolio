import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Target, Layout, Database, Code } from 'lucide-react';

export const SkillTree: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center py-10 overflow-y-auto custom-scrollbar relative">
      <h2 className="text-3xl font-bold text-white mb-2 text-center text-gradient">Operator Skill Tree</h2>
      <p className="text-zinc-500 mb-12 font-mono text-xs uppercase tracking-widest">Current Class: Product Designer / UX-UI Designer</p>

      <div className="relative w-[600px] h-[500px] flex justify-center mt-10">
        
        {/* Lines connecting skills */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path d="M 300 50 L 300 150" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M 300 150 L 150 250" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M 300 150 L 450 250" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          
          <path d="M 150 250 L 150 380" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M 450 250 L 450 380" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </svg>

        {/* Core Node */}
        <SkillNode icon={Hexagon} title="Product Thinking" level="Lv. 99" x={300} y={50} main />

        {/* Tier 2 Nodes */}
        <SkillNode icon={Layout} title="Visual Design" level="Lv. 85" x={150} y={250} />
        <SkillNode icon={Target} title="User Research" level="Lv. 90" x={450} y={250} />

        {/* Tier 3 Nodes */}
        <SkillNode icon={Code} title="MVP Strategy" level="Lv. 80" x={150} y={380} />
        <SkillNode icon={Database} title="Problem Solving" level="Lv. 85" x={450} y={380} />

      </div>
    </div>
  );
};

const SkillNode = ({ icon: Icon, title, level, x, y, main = false }: any) => {
  return (
    <motion.div 
      className="absolute flex flex-col items-center group cursor-pointer z-10"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      whileHover={{ scale: 1.1 }}
    >
      <div className={`relative flex items-center justify-center rounded-2xl ${main ? 'w-20 h-20 bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)]' : 'w-16 h-16 bg-zinc-900 border border-white/20 group-hover:border-white/50 group-hover:bg-zinc-800'}`}>
        <Icon className={`${main ? 'w-10 h-10 text-black' : 'w-7 h-7 text-white'}`} />
        
        {/* EXP Badge */}
        <div className={`absolute -bottom-3 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${main ? 'bg-black text-white' : 'bg-white text-black'}`}>
          {level}
        </div>
      </div>
      <span className="mt-5 text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{title}</span>
    </motion.div>
  );
};
