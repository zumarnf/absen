import { Skeleton } from "@/components/ui/skeleton";

interface CardListSkeletonProps {
  count?: number;
  innerRows?: number;
}

export function CardListSkeleton({
  count = 3,
  innerRows = 2,
}: CardListSkeletonProps) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-border/60 rounded-xl overflow-hidden"
        >
          <div className="bg-slate-50 p-4 border-b border-border/60">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-3 pt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: innerRows }).map((_, innerIndex) => (
              <div
                key={innerIndex}
                className="p-3 bg-slate-50/70 rounded-xl space-y-2"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
