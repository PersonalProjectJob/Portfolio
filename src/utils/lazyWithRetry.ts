import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: string; message?: string };
  const message = typeof err.message === 'string' ? err.message : '';
  const name = typeof err.name === 'string' ? err.name : '';

  return (
    name === 'ChunkLoadError' ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Expected a JavaScript-or-Wasm module script') ||
    message.includes('MIME type') ||
    message.includes('Loading chunk') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('Importing a module script failed')
  );
}

const RETRY_KEY = 'portfolio_stale_chunk_retry_timestamp';
const RETRY_THRESHOLD_MS = 15000;

export function triggerStaleChunkReload(error?: unknown): boolean {
  if (typeof window === 'undefined') return false;

  const lastRetryStr = sessionStorage.getItem(RETRY_KEY);
  const now = Date.now();

  if (!lastRetryStr || now - parseInt(lastRetryStr, 10) > RETRY_THRESHOLD_MS) {
    sessionStorage.setItem(RETRY_KEY, now.toString());
    console.warn('[lazyWithRetry] Stale chunk / deployment update detected. Reloading page to fetch latest application build...', error);
    window.location.reload();
    return true;
  }
  return false;
}

/**
 * Robust wrapper around React.lazy() that intercepts dynamic chunk loading failures
 * caused by new Vercel deployments and automatically reloads the browser to fetch
 * the latest application build.
 */
export function lazyWithRetry<T extends ComponentType<any> = ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>
): LazyExoticComponent<T> {
  return lazy(async (): Promise<{ default: T }> => {
    try {
      const module = await factory();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(RETRY_KEY);
      }
      return module as { default: T };
    } catch (error: unknown) {
      if (isChunkLoadError(error)) {
        const didReload = triggerStaleChunkReload(error);
        if (didReload) {
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}

export default lazyWithRetry;
