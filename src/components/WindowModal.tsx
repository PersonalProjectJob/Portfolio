import React from 'react';
import { useAppStore, type AppName } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minus, Sparkles } from 'lucide-react';
import { QuestMap } from './QuestMap';
import { SkillTree } from './SkillTree';

export const WindowModal: React.FC = () => {
  const { openApp, setOpenApp } = useAppStore();

  return (
    <AnimatePresence>
      {openApp && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setOpenApp(null)}
          />

          {/* Modal Window */}
          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="cyber-panel w-full max-w-6xl h-full max-h-[850px] flex flex-col relative"
          >
            {/* Window Header */}
            <div className="h-10 border-b border-amber-500/30 bg-amber-500/10 flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500" />
                <div className="w-2 h-2 bg-amber-500/50" />
                <div className="w-2 h-2 bg-amber-500/20" />
              </div>
              <div className="text-amber-500 text-xs font-bold tracking-widest uppercase">
                {openApp} - SYS_ACCESS
              </div>
              <div className="w-16 flex justify-end space-x-3 text-amber-500/50">
                <Minus className="w-4 h-4 cursor-pointer hover:text-amber-400" />
                <Maximize2 className="w-4 h-4 cursor-pointer hover:text-amber-400" />
                <X className="w-4 h-4 cursor-pointer hover:text-amber-400" onClick={() => setOpenApp(null)} />
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/20 custom-scrollbar relative">
              <AppContent appId={openApp} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AppContent = ({ appId }: { appId: AppName }) => {
  if (appId === 'figma') {
    return <QuestMap />;
  }

  if (appId === 'illustrator') {
    return <SkillTree />;
  }

  if (appId === 'gemini') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ask about my experience</h2>
          <p className="text-zinc-400 max-w-md">I've trained this Gemini Agent on my resume, design rationale, and project metrics. Ask it anything!</p>
          
          <div className="w-full max-w-2xl mt-8">
            <div className="flex gap-2 mb-4">
              <div className="bg-white/5 text-zinc-300 px-4 py-2 rounded-full text-sm border border-white/10 hover:bg-white/10 cursor-pointer">What is your design process?</div>
              <div className="bg-white/5 text-zinc-300 px-4 py-2 rounded-full text-sm border border-white/10 hover:bg-white/10 cursor-pointer">Tell me about Fintech App metrics</div>
            </div>
            <div className="glass-panel flex items-center px-4 py-3 rounded-xl border border-white/10">
              <input type="text" placeholder="Ask Gemini..." className="bg-transparent border-none outline-none text-white flex-1 placeholder:text-zinc-500" />
              <button className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-zinc-200">Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-zinc-500">
      <p>App module <span className="text-white font-medium capitalize">{appId}</span> is under construction.</p>
    </div>
  );
};
