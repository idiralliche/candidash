import '@tanstack/react-router';
import type { AuthContextType } from '@/context/auth-context';
import type { router } from '@/router';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface RouterContext {
    auth: AuthContextType;
  }
}

export { };
