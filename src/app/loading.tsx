import { VideoGridSkeleton } from '@/components/VideoSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-2 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </div>

      <VideoGridSkeleton count={20} />
    </div>
  );
}
