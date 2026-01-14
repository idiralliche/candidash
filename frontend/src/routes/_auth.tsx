import { createRoute, Outlet, redirect } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import type { AuthContextType } from '@/context/auth-context';

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_auth',

  // 🔒 SECURITY GUARD - Check authentication via context
  beforeLoad: ({ context }) => {
    // Type assertion since RouterContext is not properly inferred in beforeLoad
    const auth = (context as { auth: AuthContextType }).auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },

  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 p-20">
        <Outlet />
      </div>
    </div>
  );
}
