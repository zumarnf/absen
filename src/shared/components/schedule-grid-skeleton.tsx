import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleGridSkeletonProps {
  days?: number;
  shiftsPerDay?: number;
}

export function ScheduleGridSkeleton({
  days = 7,
  shiftsPerDay = 2,
}: ScheduleGridSkeletonProps) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {Array.from({ length: days }).map((_, dayIndex) => (
        <div
          key={dayIndex}
          className="border rounded-lg p-4 text-center bg-muted/40 space-y-3"
        >
          <Skeleton className="mx-auto h-4 w-16" />
          <Skeleton className="mx-auto h-3 w-10" />
          <div className="space-y-2 pt-1">
            {Array.from({ length: shiftsPerDay }).map((_, shiftIndex) => (
              <Skeleton key={shiftIndex} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
