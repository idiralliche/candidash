import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: ReactNode; // CTA optionnel
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-white-light bg-surface-base p-12 text-center">
      <div className="mb-4 rounded-full bg-white-light p-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">{message}</h3>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
