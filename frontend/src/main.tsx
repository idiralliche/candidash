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
import { registerRoute } from './routes/register';
import { authRoute } from './routes/_auth';
import { dashboardRoute } from './routes/dashboard';
import { accountRoute } from './routes/account';
import { companiesRoute } from './routes/companies';
import { opportunitiesRoute } from './routes/opportunities';
import { scheduledEventsRoute } from './routes/scheduled-events';

// Import Context Providers
import { AuthProvider } from './context/auth-provider';

// Create Route Tree Manually
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authRoute.addChildren([
    dashboardRoute,
    accountRoute,
    companiesRoute,
    opportunitiesRoute,
    scheduledEventsRoute,
  ]),
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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
