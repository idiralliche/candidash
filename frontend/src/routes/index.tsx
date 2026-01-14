import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { LandingPage } from '@/pages/home/landing-page';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});
