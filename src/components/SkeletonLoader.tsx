import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-start gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="h-16 w-3/4 rounded-3xl rounded-tl-lg" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-2/3 rounded-3xl rounded-tr-lg" />
      </div>
      <div className="flex justify-start gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="h-24 w-4/5 rounded-3xl rounded-tl-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
      <Skeleton className="h-10 w-3/4 rounded-xl" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="min-w-[200px] h-36 rounded-3xl" />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}
