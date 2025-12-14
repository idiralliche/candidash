import { createRoute, Outlet, redirect } from '@tanstack/react-router';
import { rootRoute } from './__root';

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_auth',

  // 🔒 SECURITY GUARD
  beforeLoad: () => {
    const token = localStorage.getItem('token');
    if (!token) {
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
