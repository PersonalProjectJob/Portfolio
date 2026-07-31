import React from 'react';
import { useStore } from '../store/useStore';

/**
 * Language toggle chip: [VN] [EN]
 * Chip design with active background indicator.
 */
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, isLightMode } = useStore();

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg p-0.5 transition-colors ${
        isLightMode
          ? 'bg-slate-100 border border-slate-200'
          : 'bg-slate-800/80 border border-slate-700'
      }`}
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`relative flex items-center justify-center px-3 h-9 md:h-[38px] rounded-md text-[11px] md:text-xs font-bold tracking-wider cursor-pointer transition-all duration-200 ${
          language === 'vi'
            ? isLightMode
              ? 'bg-white text-orange-600 shadow-sm'
              : 'bg-slate-700 text-white shadow-sm'
            : isLightMode
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
        }`}
        aria-label="Chuyển sang Tiếng Việt"
      >
        VN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative flex items-center justify-center px-3 h-9 md:h-[38px] rounded-md text-[11px] md:text-xs font-bold tracking-wider cursor-pointer transition-all duration-200 ${
          language === 'en'
            ? isLightMode
              ? 'bg-white text-orange-600 shadow-sm'
              : 'bg-slate-700 text-white shadow-sm'
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
