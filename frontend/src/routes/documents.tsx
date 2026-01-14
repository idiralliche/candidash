import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { DocumentsPage } from '@/pages/documents/documents-page';

export const documentsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/documents',
  component: DocumentsPage,
});
