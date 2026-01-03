import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="space-y-6 pt-5 pb-10 flex flex-col min-h-screen">
      {children}
    </div>
  );
}
