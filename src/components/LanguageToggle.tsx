import React from 'react';
import { useStore } from '../store/useStore';

/**
 * Language toggle pill: VN | EN
 * Compact design to fit inside header control groups.
 */
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, isLightMode } = useStore();

  return (
    <div className="flex items-center h-full text-[11px] font-bold tracking-wider">
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-2.5 h-full flex items-center justify-center cursor-pointer transition-all ${
          language === 'vi'
            ? isLightMode
              ? 'text-orange-600'
              : 'text-white'
            : isLightMode
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
        }`}
        aria-label="Chuyển sang Tiếng Việt"
      >
        VN
      </button>
      <div className={`w-[1px] h-3/5 transition-colors ${isLightMode ? 'bg-slate-300' : 'bg-slate-600'}`} />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 h-full flex items-center justify-center cursor-pointer transition-all ${
          language === 'en'
            ? isLightMode
              ? 'text-orange-600'
              : 'text-white'
            : isLightMode
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};
