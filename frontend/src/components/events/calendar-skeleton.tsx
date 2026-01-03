import { Skeleton } from '@/components/ui/skeleton';

export function CalendarSkeleton() {
  return (
    <div className="w-full bg-surface-base rounded-xl border border-white-light p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white-light">
        <Skeleton className="h-8 w-48 bg-white-light" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 bg-white-light" />
          <Skeleton className="h-7 w-16 bg-white-light" />
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl bg-white-subtle" />
        ))}
      </div>
    </div>
  );
}
