import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { LoginPage } from '@/pages/auth/login-page';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});
