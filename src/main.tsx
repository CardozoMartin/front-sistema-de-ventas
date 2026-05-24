import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Global error handler for Vite dynamic import failures (Netlify caching issue)
window.addEventListener('error', (e) => {
  if (
    e.message &&
    (e.message.includes('Failed to fetch dynamically imported module') ||
     e.message.includes('Expected a JavaScript-or-Wasm module script'))
  ) {
    window.location.reload();
  }
}, true);

const queryClient = new QueryClient({
  defaultOptions: {
     queries: {
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 10, 
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Solo en desarrollo */}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </StrictMode>,
)
