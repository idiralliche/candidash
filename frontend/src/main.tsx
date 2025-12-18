import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Import core parts
import { queryClient } from './lib/query-client';
import { AuthProvider } from './context/auth-provider';
import { App } from './App';

// Hide initial HTML loader once React is ready
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.style.display = 'none';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
