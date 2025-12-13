import { createRoute } from '@tanstack/react-router';
import { authRoute } from './_auth';
import { CompaniesPage } from '@/pages/companies/companies-page';

export const companiesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/companies',
  component: CompaniesPage,
});
