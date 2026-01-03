import { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="mx-auto w-full">
      {children}
    </div>
  );
}
