import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { OpportunitiesPage } from '@/pages/opportunities/opportunities-page';

export const opportunitiesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/opportunities',
  component: OpportunitiesPage,
});
