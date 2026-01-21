import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { ProductsPage } from '@/pages/products/products-page';

export const productsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/products',
  component: ProductsPage,
});
