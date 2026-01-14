import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { ContactsPage } from '@/pages/contacts/contacts-page';

export const contactsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/contacts',
  component: ContactsPage,
});
