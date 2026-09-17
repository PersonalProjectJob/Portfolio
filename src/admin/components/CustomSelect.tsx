import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  disabled?: boolean;
}

export type SelectAccentColor =
  | 'teal'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'amber'
  | 'blue'
  | 'purple';

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'subtle';
  align?: 'left' | 'right';
  accentColor?: SelectAccentColor;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  className?: string;
  menuClassName?: string;
  id?: string;
}

const ACCENT_STYLES: Record<
  SelectAccentColor,
  {
    triggerHoverFocusLight: string;
    triggerHoverFocusDark: string;
    triggerOpenLight: string;
    triggerOpenDark: string;
    chevronOpenLight: string;
    chevronOpenDark: string;
    iconLight: string;
    iconDark: string;
    badgeLight: string;
    badgeDark: string;
    selectedLight: string;
    selectedDark: string;
    checkLight: string;
    checkDark: string;
    searchFocusLight: string;
    searchFocusDark: string;
  }
> = {
  emerald: {
    triggerHoverFocusLight: 'hover:border-emerald-500/60 focus:border-emerald-600 focus:ring-emerald-500/20',
    triggerHoverFocusDark: 'hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-emerald-500/20',
    triggerOpenLight: 'border-emerald-600 ring-2 ring-emerald-500/20',
    triggerOpenDark: 'border-emerald-500 ring-2 ring-emerald-500/20',
    chevronOpenLight: 'text-emerald-600',
    chevronOpenDark: 'text-emerald-400',
    iconLight: 'text-emerald-600',
    iconDark: 'text-emerald-400',
    badgeLight: 'bg-emerald-100 text-emerald-800',
    badgeDark: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    selectedLight: 'bg-emerald-50 text-emerald-800 font-semibold',
    selectedDark: 'bg-emerald-500/20 text-emerald-300 font-semibold',
    checkLight: 'text-emerald-600',
    checkDark: 'text-emerald-400',
    searchFocusLight: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
    searchFocusDark: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
  },
  teal: {
    triggerHoverFocusLight: 'hover:border-teal-500/60 focus:border-teal-600 focus:ring-teal-500/20',
    triggerHoverFocusDark: 'hover:border-teal-500/40 focus:border-teal-500 focus:ring-teal-500/20',
    triggerOpenLight: 'border-teal-600 ring-2 ring-teal-500/20',
    triggerOpenDark: 'border-teal-500 ring-2 ring-teal-500/20',
    chevronOpenLight: 'text-teal-600',
    chevronOpenDark: 'text-teal-400',
    iconLight: 'text-teal-600',
    iconDark: 'text-teal-400',
    badgeLight: 'bg-teal-100 text-teal-800',
    badgeDark: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    selectedLight: 'bg-teal-50 text-teal-800 font-semibold',
    selectedDark: 'bg-teal-500/20 text-teal-300 font-semibold',
    checkLight: 'text-teal-600',
    checkDark: 'text-teal-400',
    searchFocusLight: 'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
    searchFocusDark: 'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
  },
  indigo: {
    triggerHoverFocusLight: 'hover:border-indigo-500/60 focus:border-indigo-600 focus:ring-indigo-500/20',
    triggerHoverFocusDark: 'hover:border-indigo-500/40 focus:border-indigo-500 focus:ring-indigo-500/20',
    triggerOpenLight: 'border-indigo-600 ring-2 ring-indigo-500/20',
    triggerOpenDark: 'border-indigo-500 ring-2 ring-indigo-500/20',
    chevronOpenLight: 'text-indigo-600',
    chevronOpenDark: 'text-indigo-400',
    iconLight: 'text-indigo-600',
    iconDark: 'text-indigo-400',
    badgeLight: 'bg-indigo-100 text-indigo-800',
    badgeDark: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    selectedLight: 'bg-indigo-50 text-indigo-800 font-semibold',
    selectedDark: 'bg-indigo-500/20 text-indigo-300 font-semibold',
    checkLight: 'text-indigo-600',
    checkDark: 'text-indigo-400',
    searchFocusLight: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
    searchFocusDark: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
  },
  rose: {
    triggerHoverFocusLight: 'hover:border-rose-500/60 focus:border-rose-600 focus:ring-rose-500/20',
    triggerHoverFocusDark: 'hover:border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/20',
    triggerOpenLight: 'border-rose-600 ring-2 ring-rose-500/20',
    triggerOpenDark: 'border-rose-500 ring-2 ring-rose-500/20',
    chevronOpenLight: 'text-rose-600',
    chevronOpenDark: 'text-rose-400',
    iconLight: 'text-rose-600',
    iconDark: 'text-rose-400',
    badgeLight: 'bg-rose-100 text-rose-800',
    badgeDark: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    selectedLight: 'bg-rose-50 text-rose-800 font-semibold',
    selectedDark: 'bg-rose-500/20 text-rose-300 font-semibold',
    checkLight: 'text-rose-600',
    checkDark: 'text-rose-400',
    searchFocusLight: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20',
    searchFocusDark: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20',
  },
  amber: {
    triggerHoverFocusLight: 'hover:border-amber-500/60 focus:border-amber-600 focus:ring-amber-500/20',
    triggerHoverFocusDark: 'hover:border-amber-500/40 focus:border-amber-500 focus:ring-amber-500/20',
    triggerOpenLight: 'border-amber-600 ring-2 ring-amber-500/20',
    triggerOpenDark: 'border-amber-500 ring-2 ring-amber-500/20',
    chevronOpenLight: 'text-amber-600',
    chevronOpenDark: 'text-amber-400',
    iconLight: 'text-amber-600',
    iconDark: 'text-amber-400',
    badgeLight: 'bg-amber-100 text-amber-800',
    badgeDark: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    selectedLight: 'bg-amber-50 text-amber-800 font-semibold',
    selectedDark: 'bg-amber-500/20 text-amber-300 font-semibold',
    checkLight: 'text-amber-600',
    checkDark: 'text-amber-400',
    searchFocusLight: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
    searchFocusDark: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
  },
  blue: {
    triggerHoverFocusLight: 'hover:border-blue-500/60 focus:border-blue-600 focus:ring-blue-500/20',
    triggerHoverFocusDark: 'hover:border-blue-500/40 focus:border-blue-500 focus:ring-blue-500/20',
    triggerOpenLight: 'border-blue-600 ring-2 ring-blue-500/20',
    triggerOpenDark: 'border-blue-500 ring-2 ring-blue-500/20',
    chevronOpenLight: 'text-blue-600',
    chevronOpenDark: 'text-blue-400',
    iconLight: 'text-blue-600',
    iconDark: 'text-blue-400',
    badgeLight: 'bg-blue-100 text-blue-800',
    badgeDark: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    selectedLight: 'bg-blue-50 text-blue-800 font-semibold',
    selectedDark: 'bg-blue-500/20 text-blue-300 font-semibold',
    checkLight: 'text-blue-600',
    checkDark: 'text-blue-400',
    searchFocusLight: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    searchFocusDark: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  },
  purple: {
    triggerHoverFocusLight: 'hover:border-purple-500/60 focus:border-purple-600 focus:ring-purple-500/20',
    triggerHoverFocusDark: 'hover:border-purple-500/40 focus:border-purple-500 focus:ring-purple-500/20',
    triggerOpenLight: 'border-purple-600 ring-2 ring-purple-500/20',
    triggerOpenDark: 'border-purple-500 ring-2 ring-purple-500/20',
    chevronOpenLight: 'text-purple-600',
    chevronOpenDark: 'text-purple-400',
    iconLight: 'text-purple-600',
    iconDark: 'text-purple-400',
    badgeLight: 'bg-purple-100 text-purple-800',
    badgeDark: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    selectedLight: 'bg-purple-50 text-purple-800 font-semibold',
    selectedDark: 'bg-purple-500/20 text-purple-300 font-semibold',
    checkLight: 'text-purple-600',
    checkDark: 'text-purple-400',
    searchFocusLight: 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
    searchFocusDark: 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  },
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  disabled = false,
  size = 'md',
  variant = 'default',
  align = 'left',
  accentColor = 'teal',
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  clearable = false,
  className = '',
  menuClassName = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLightMode } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.teal;

  // Find selected option from full options
  const selectedOption = options.find((opt) => opt.value === value);

  // Filtered options based on search query
  const displayOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q) ||
        opt.badge?.toLowerCase().includes(q)
    );
  }, [options, searchable, searchQuery]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const idx = displayOptions.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (next < displayOptions.length && displayOptions[next]?.disabled) {
            next++;
          }
          return next < displayOptions.length ? next : prev;
        });
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && displayOptions[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      }

      case 'Enter': {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
          const opt = displayOptions[highlightedIndex];
          if (opt && !opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
          }
        }
        break;
      }

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const items = listboxRef.current.querySelectorAll('li');
      const targetItem = items[highlightedIndex];
      if (targetItem) {
        targetItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[34px]',
    md: 'px-3.5 py-2.5 text-xs rounded-xl min-h-[40px]',
    lg: 'px-4 py-3 text-sm rounded-2xl min-h-[48px]',
  }[size];

  // Base Trigger Styles
  const triggerThemeStyles = isLightMode
    ? `bg-white border-slate-300/80 text-slate-800 shadow-sm focus:ring-2 ${accent.triggerHoverFocusLight}`
    : `bg-slate-900/80 border-slate-800 text-slate-100 shadow-lg shadow-black/30 focus:ring-2 ${accent.triggerHoverFocusDark}`;

  const triggerOpenStyles = isOpen
    ? isLightMode
      ? accent.triggerOpenLight
      : accent.triggerOpenDark
    : '';

  const pillThemeStyles = variant === 'pill' ? '!rounded-full' : '';
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${isOpen ? 'z-50' : 'z-10'} ${className}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-xs font-semibold mb-1.5 ${
            isLightMode ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          {label}
        </label>
      )}

      {/* ─── Dropdown Trigger Button ─── */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            const idx = displayOptions.findIndex((opt) => opt.value === value);
            setHighlightedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2.5 font-medium border backdrop-blur-xl transition-all duration-200 cursor-pointer text-left focus:outline-none ${sizeClasses} ${triggerThemeStyles} ${triggerOpenStyles} ${pillThemeStyles} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <selectedOption.icon
              className={`w-4 h-4 shrink-0 ${
                isLightMode ? accent.iconLight : accent.iconDark
              }`}
            />
          )}
          <span
            className={`truncate ${
              !selectedOption
                ? isLightMode
                  ? 'text-slate-400 font-normal'
                  : 'text-slate-500 font-normal'
                : 'font-semibold'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                isLightMode ? accent.badgeLight : accent.badgeDark
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className={`p-0.5 rounded-md transition-colors ${
                isLightMode
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Xóa lựa chọn"
            >
              <X className="w-3 h-3" />
            </span>
          )}

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="shrink-0"
          >
            <ChevronDown
              className={`w-4 h-4 transition-colors ${
                isOpen
                  ? isLightMode
                    ? accent.chevronOpenLight
                    : accent.chevronOpenDark
                  : isLightMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            />
          </motion.div>
        </div>
      </button>

      {/* ─── Floating Options Menu ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${alignClass} z-[100] mt-1.5 w-full min-w-full max-h-80 flex flex-col rounded-2xl border p-1.5 backdrop-blur-2xl shadow-2xl ${
              isLightMode
                ? 'bg-white/95 border-slate-200 shadow-xl shadow-slate-300/80'
                : 'bg-slate-950/95 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
            } ${menuClassName}`}
          >
            {/* Search Input Filter */}
            {searchable && (
              <div className="p-1.5 mb-1 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="relative flex items-center">
                  <Search
                    className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
                      isLightMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                      isLightMode
                        ? `bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 ${accent.searchFocusLight}`
                        : `bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500 ${accent.searchFocusDark}`
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <ul
              ref={listboxRef}
              role="listbox"
              aria-labelledby={selectId}
              className="space-y-0.5 overflow-y-auto flex-1 pr-1 custom-select-scrollbar"
            >
              {displayOptions.length === 0 ? (
                <li className="py-6 px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Không tìm thấy kết quả phù hợp
                </li>
              ) : (
                displayOptions.map((option, idx) => {
                  const isSelected = option.value === value;
                  const isHighlighted = idx === highlightedIndex;
                  const IconComponent = option.icon;

                  let itemStyles = '';
                  if (option.disabled) {
                    itemStyles = isLightMode
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 cursor-not-allowed';
                  } else if (isSelected) {
                    itemStyles = isLightMode
                      ? accent.selectedLight
                      : accent.selectedDark;
                  } else if (isHighlighted) {
                    itemStyles = isLightMode
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-slate-900 text-slate-100';
                  } else {
                    itemStyles = isLightMode
                      ? 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-slate-100';
                  }

                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      onClick={() => {
                        if (!option.disabled) {
                          onChange(option.value);
                          setIsOpen(false);
                        }
                      }}
                      onMouseEnter={() => !option.disabled && setHighlightedIndex(idx)}
                      className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${itemStyles}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {IconComponent && (
                          <IconComponent
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected
                                ? isLightMode
                                  ? accent.iconLight
                                  : accent.iconDark
                                : isLightMode
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              {option.label}
                            </span>
                            {option.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono shrink-0 ${
                                  isSelected
                                    ? isLightMode
                                      ? accent.badgeLight
                                      : accent.badgeDark
                                    : isLightMode
                                    ? 'bg-slate-200/80 text-slate-700'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {option.badge}
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <span
                              className={`block text-[10px] font-normal truncate mt-0.5 ${
                                isLightMode ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 flex items-center pl-1">
                          <Check
                            className={`w-3.5 h-3.5 ${
                              isLightMode ? accent.checkLight : accent.checkDark
                            }`}
                          />
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
