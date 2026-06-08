export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-ivory via-white to-ivory border border-navy/10 bg-[length:200%_100%] rounded-sm ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton({ count = 1 }: { count?: number }) {
  const list = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {list.map((n) => (
        <div key={n} className="flex flex-col gap-4 animate-pulse">
          <div className="aspect-[3/4] bg-neutral-250 rounded-sm" />
          <div className="h-6 w-2/3 bg-neutral-250 rounded-sm" />
          <div className="h-4 w-full bg-neutral-250 rounded-sm" />
        </div>
      ))}
    </>
  );
}
