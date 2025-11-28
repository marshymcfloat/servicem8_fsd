import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingDetailSkeleton() {
  return (
    <>
      <Card className="p-6 mb-6">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </Card>
    </>
  );
}

