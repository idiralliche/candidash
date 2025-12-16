import { createRoute } from '@tanstack/react-router';
import { authRoute } from './_auth';
import { EventsPage } from '@/pages/events/events-page';

export const scheduledEventsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/scheduled-events',
  component: EventsPage,
});
