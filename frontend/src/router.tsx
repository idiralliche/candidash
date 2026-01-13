import { createRouter } from '@tanstack/react-router';

// Import Routes
import { rootRoute } from '@/routes/__root';
import { indexRoute } from '@/routes/index';
import { loginRoute } from '@/routes/login';
import { registerRoute } from '@/routes/register';
import { authRoute } from '@/routes/_auth';
import { dashboardRoute } from '@/routes/dashboard';
import { accountRoute } from '@/routes/account';
import { companiesRoute } from '@/routes/companies';
import { opportunitiesRoute } from '@/routes/opportunities';
import { scheduledEventsRoute } from '@/routes/scheduled-events';
import { contactsRoute } from '@/routes/contacts';
import { documentsRoute } from '@/routes/documents';
import { productsRoute } from '@/routes/products';
import { applicationsRoute } from '@/routes/applications';
import { actionsRoute } from '@/routes/actions';

// Create Route Tree
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
    contactsRoute,
    documentsRoute,
    productsRoute,
    applicationsRoute,
    actionsRoute,
  ]),
]);

// Create Router Instance with typed context and loading state
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
  defaultPendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-surface-base">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    </div>
  ),
});

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
