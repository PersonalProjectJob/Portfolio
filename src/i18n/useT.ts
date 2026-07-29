import { useStore } from '../store/useStore';
import { vi } from './vi';
import { en } from './en';

const dictionaries = { vi, en } as const;

/**
 * Translation hook — returns a function `t(key)` that resolves
 * the current language's text for the given key.
 * 
 * Usage:
 *   const t = useT();
 *   <h1>{t('dispatch.hero.title')}</h1>
 * 
 * For keys containing HTML (e.g. <strong>, <code>, <em>):
 *   <span dangerouslySetInnerHTML={{ __html: t('key.with.html') }} />
 */
export function useT() {
  const language = useStore((s) => s.language);
  const dict = dictionaries[language];
  return (key: string): string => {
    return (dict as Record<string, string>)[key] ?? key;
  };
}
