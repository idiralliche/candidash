import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import type { AuthContextType } from '@/context/auth-context';

// Define root route context type
interface RootRouteContext {
  auth: AuthContextType;
}

export const rootRoute = createRootRoute<RootRouteContext>({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-[70px]">
        <Outlet />
      </main>

      <Footer />
      <Toaster />
    </>
  );
}
