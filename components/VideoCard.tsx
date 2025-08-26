import Image from 'next/image';
import Link from 'next/link';
import {
  formatViewCount,
  formatRelativeTime,
  getBestThumbnail,
  formatDuration,
} from '@/lib/format';
import type { VideoCardData } from '@/types/youtube';

interface VideoCardProps {
  video: VideoCardData;
  showChannel?: boolean;
  className?: string;
}

export function VideoCard({
  video,
  showChannel = true,
  className = '',
}: VideoCardProps) {
  const thumbnailUrl = getBestThumbnail(video.thumbnails);

  return (
    <Link
      href={`/video/${video.id}`}
      className={`group block bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${className}`}
    >
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {/* Duration overlay */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        {showChannel && (
          <p className="text-sm text-muted-foreground mb-1">
            {video.channelTitle}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {video.viewCount && (
            <>
              <span>{formatViewCount(video.viewCount)} lượt xem</span>
              <span>•</span>
            </>
          )}
          <span>{formatRelativeTime(video.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
