import { createRoute } from '@tanstack/react-router';
import { authRoute } from './_auth';
import { ProductsPage } from '@/pages/product/products-page';

export const productsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/products',
  component: ProductsPage,
});
