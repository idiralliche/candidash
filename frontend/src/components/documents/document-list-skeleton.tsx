import { Skeleton } from '@/components/ui/skeleton';

export function DocumentListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 h-[82px]"
        >
          <div className="flex items-center gap-4 w-1/2">
            {/* Icon Skeleton */}
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2 flex-1">
              {/* Title Skeleton */}
              <Skeleton className="h-4 w-3/4" />
              {/* Type Skeleton */}
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          {/* Actions Skeleton */}
          <div className="flex gap-2">
             <Skeleton className="h-6 w-16 rounded-full" />
             <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
