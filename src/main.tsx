import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

// Handle deployment hash mismatch: auto-reload when Vite detects dynamic chunk preload error
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[vite:preloadError] Bundle hash mismatch after deployment. Reloading latest assets...', event);
    const retryKey = 'portfolio_stale_chunk_retry_timestamp';
    const lastRetry = sessionStorage.getItem(retryKey);
    const now = Date.now();
    if (!lastRetry || now - parseInt(lastRetry, 10) > 15000) {
      sessionStorage.setItem(retryKey, now.toString());
      window.location.reload();
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

