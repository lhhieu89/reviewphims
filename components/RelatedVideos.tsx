import Image from 'next/image';
import Link from 'next/link';
import { env } from '@/lib/env';
import { formatRelativeTime, getBestThumbnail } from '@/lib/format';
import type { ListResponse, YouTubeSearchItem, VideoCardData } from '@/types/youtube';

interface RelatedVideosProps {
  videoId: string;
}

async function getRelatedVideos(videoId: string): Promise<VideoCardData[]> {
  try {
    const response = await fetch(
      `${env.SITE_URL}/api/youtube/related?id=${videoId}&maxResults=12`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch related videos');
    }

    const data: ListResponse<YouTubeSearchItem> = await response.json();
    return data.items.map((item): VideoCardData => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    }));
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return [];
  }
}

// Loading skeleton
function RelatedVideosSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex gap-3 animate-pulse"
        >
          <div className="w-40 aspect-video bg-muted rounded" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-1" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RelatedVideos({ videoId }: RelatedVideosProps) {
  const relatedVideos = await getRelatedVideos(videoId);

  if (relatedVideos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Không có video liên quan
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {relatedVideos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="flex gap-3 group hover:bg-card p-2 rounded-lg transition-colors"
        >
          <div className="relative w-40 aspect-video bg-muted rounded overflow-hidden flex-shrink-0">
            <Image
              src={getBestThumbnail(video.thumbnails)}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="160px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {video.channelTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(video.publishedAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Export loading component for use with Suspense
export { RelatedVideosSkeleton }; 