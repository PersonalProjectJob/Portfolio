import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'subtle';
  className?: string;
  menuClassName?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  menuClassName = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const { isLightMode } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

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
        const idx = options.findIndex((opt) => opt.value === value);
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
          while (next < options.length && options[next]?.disabled) {
            next++;
          }
          return next < options.length ? next : prev;
        });
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && options[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      }

      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
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
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[32px]',
    md: 'px-3.5 py-2.5 text-xs rounded-xl min-h-[40px]',
    lg: 'px-4 py-3 text-sm rounded-2xl min-h-[48px]',
  }[size];

  // Base Trigger Styles
  const triggerThemeStyles = isLightMode
    ? 'bg-white border-slate-300/80 text-slate-800 hover:border-teal-500/60 shadow-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20'
    : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-teal-500/40 shadow-lg shadow-black/30 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  const pillThemeStyles = variant === 'pill' ? '!rounded-full' : '';

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${isOpen ? 'z-50' : 'z-10'} ${className}`}
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
            const idx = options.findIndex((opt) => opt.value === value);
            setHighlightedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2.5 font-medium border backdrop-blur-xl transition-all duration-200 cursor-pointer text-left focus:outline-none ${sizeClasses} ${triggerThemeStyles} ${pillThemeStyles} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? (isLightMode ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-teal-500 ring-2 ring-teal-500/20') : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <selectedOption.icon
              className={`w-4 h-4 shrink-0 ${
                isLightMode ? 'text-teal-600' : 'text-teal-400'
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
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                isLightMode
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors ${
              isOpen
                ? isLightMode
                  ? 'text-teal-600'
                  : 'text-teal-400'
                : isLightMode
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          />
        </motion.div>
      </button>

      {/* ─── Floating Options Menu ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute right-0 z-[100] mt-1.5 min-w-full sm:min-w-[220px] max-h-72 overflow-y-auto rounded-2xl border p-1.5 backdrop-blur-2xl shadow-2xl ${
              isLightMode
                ? 'bg-white/95 border-slate-200 shadow-xl shadow-slate-300/80'
                : 'bg-slate-950/95 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
            } ${menuClassName}`}
          >
            <ul
              ref={listboxRef}
              role="listbox"
              aria-labelledby={selectId}
              className="space-y-0.5"
            >
              {options.map((option, idx) => {
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
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'bg-teal-500/20 text-teal-300 font-semibold';
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
                    <div className="flex items-center gap-2 truncate">
                      {IconComponent && (
                        <IconComponent
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected
                              ? isLightMode
                                ? 'text-teal-700'
                                : 'text-teal-400'
                              : isLightMode
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <span className="block truncate">{option.label}</span>
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

                    <div className="flex items-center gap-2 shrink-0">
                      {option.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            isLightMode
                              ? 'bg-slate-200/80 text-slate-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isLightMode ? 'text-teal-600' : 'text-teal-400'
                          }`}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
