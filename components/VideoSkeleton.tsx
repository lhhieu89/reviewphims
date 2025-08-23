export function VideoSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4">
        <div className="h-4 bg-muted rounded mb-2" />
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 mb-1" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoSkeleton key={i} />
      ))}
    </div>
  );
}
