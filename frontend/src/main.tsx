import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Import core parts
import { queryClient } from './lib/query-client';

// Import Routes
import { rootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { loginRoute } from './routes/login';

// Create Route Tree Manually
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
]);

// Create Router Instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
