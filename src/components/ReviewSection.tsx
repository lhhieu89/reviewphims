import Link from 'next/link';
import { VideoGrid } from './VideoGrid';
import type { VideoCardData } from '@/types/youtube';

interface ReviewSectionProps {
  title: string;
  subtitle?: string;
  videos: VideoCardData[];
  viewAllLink?: string;
  loading?: boolean;
  error?: string;
  fallbackUrl?: string;
  className?: string;
}

export function ReviewSection({
  title,
  subtitle,
  videos,
  viewAllLink,
  loading = false,
  error,
  fallbackUrl,
  className = '',
}: ReviewSectionProps) {
  if (loading) {
    return (
      <section className={`space-y-6 ${className}`}>
        <div className="text-center space-y-2">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto animate-pulse" />
          {subtitle && (
            <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse" />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-video bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`space-y-6 ${className}`}>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground">
            Không thể tải nội dung
          </h3>
          <p className="text-muted-foreground">{error}</p>
          {fallbackUrl && (
            <Link
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Xem trên YouTube
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Xem tất cả →
            </Link>
          )}
        </div>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      <VideoGrid videos={videos} showChannel={true} />

      {videos.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">🎬</div>
          <h3 className="text-xl font-semibold text-foreground">
            Chưa có video nào
          </h3>
          <p className="text-muted-foreground">
            Hiện tại chưa có video review phim nào trong danh mục này.
          </p>
        </div>
      )}
    </section>
  );
}
