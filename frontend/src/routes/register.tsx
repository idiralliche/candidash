import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { RegisterPage } from '@/pages/auth/register-page';

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

