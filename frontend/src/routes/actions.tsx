import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { ActionsPage } from '@/pages/actions/actions-page';

export const actionsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/actions',
  component: ActionsPage,
});
