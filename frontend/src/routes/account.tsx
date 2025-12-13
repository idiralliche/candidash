import { createRoute } from '@tanstack/react-router';
import { authRoute } from './_auth';
import { AccountPage } from '@/pages/account/account-page';

export const accountRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/account',
  component: AccountPage,
});
