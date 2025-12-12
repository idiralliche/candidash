import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const rootRoute = createRootRoute({
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
    </>
  );
}
