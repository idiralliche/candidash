import { RouterProvider } from '@tanstack/react-router';
import { useAuth } from '@/hooks/shared/use-auth';
import { router } from '@/router';

export function App() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}
