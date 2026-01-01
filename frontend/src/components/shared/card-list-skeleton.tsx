import { Skeleton } from "@/components/ui/skeleton";

interface CardListSkeletonProps {
  count?: number;
  avatarShape?: "square" | "circle";
  cardHeight?: string;
}

export function CardListSkeleton({
  count = 3,
  avatarShape = "square",
  cardHeight = "h-[82px]",
}: CardListSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-4 ${cardHeight}`}
        >
          <div className="flex items-center gap-4 w-full">
            {/* Icon/Avatar Skeleton */}
            <Skeleton
              className={`h-10 w-10 ${
                avatarShape === "circle" ? "rounded-full" : "rounded-md"
              } bg-white-light  shrink-0`}
            />

            {/* Text Content Skeleton */}
            <div className="space-y-2 flex-1">
              {/* Title */}
              <Skeleton className="h-4 w-3/4 bg-white-light " />
              {/* Subtitle */}
              <Skeleton className="h-3 w-1/2 bg-white-subtle " />
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-white-subtle " />
            <Skeleton className="h-8 w-8 rounded-md bg-white-subtle " />
          </div>
        </div>
      ))}
    </div>
  );
}
