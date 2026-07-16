import { motion } from 'framer-motion';

export const LoadingSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center w-full h-[60vh] gap-4"
  >
    <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
    <p className="text-sm text-slate-400 tracking-widest uppercase font-bold">Loading...</p>
  </motion.div>
);
