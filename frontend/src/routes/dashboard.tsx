import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';

export const dashboardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/dashboard',
  component: DashboardPage,
});
