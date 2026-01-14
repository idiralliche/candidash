import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { ApplicationsPage } from '@/pages/applications/applications-page';

export const applicationsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/applications',
  component: ApplicationsPage,
});
