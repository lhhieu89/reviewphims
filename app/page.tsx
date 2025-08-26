import { Metadata } from 'next';
import {
  ListResponse,
  YouTubeVideo,
  YouTubeSearchItem,
  VideoCardData,
} from '@/types/youtube';
import { ClientVideoSection } from '@/components/ClientVideoSection';
import { env } from '@/lib/env';

// Remove force-dynamic to enable better caching
// export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes - reduced for easier testing

export const metadata: Metadata = {
  title: 'Review Phim - Xem Review Phim Mới Nhất 2025',
  description:
    'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim được đánh giá cao.',
  alternates: {
    canonical: `${env.SITE_URL}/`,
  },
  openGraph: {
    title: 'Review Phim - Khám phá video review phim hay nhất',
    description:
      'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Review phim Việt, phim quốc tế, tất cả thể loại.',
    url: env.SITE_URL,
  },
};

// Helper function to convert different video types to VideoCardData
function convertToVideoCardData(
  item: YouTubeVideo | VideoCardData
): VideoCardData {
  // If it's already VideoCardData (from cache API), return as is
  if ('duration' in item && 'viewCount' in item) {
    return item as VideoCardData;
  }

  // YouTubeVideo
  const video = item as YouTubeVideo;
  return {
    id: video.id,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics?.viewCount,
    thumbnails: video.snippet.thumbnails,
    duration: video.contentDetails?.duration,
  };
}

async function getCachedVideos(
  type: 'general' | 'costume_drama' | 'trailers',
  count: number = 16
): Promise<{
  videos: VideoCardData[];
  error?: string;
  fallbackUrl?: string;
}> {
  try {
    // Initialize cache if needed
    const response = await fetch(`${env.SITE_URL}/api/cache/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'initialize_cache' }),
    });

    // Get videos from cache
    const cacheUrl = `${env.SITE_URL}/api/cache/videos?type=${type}&count=${count}`;
    console.log('DEBUG: Fetching from URL:', cacheUrl);
    const videosResponse = await fetch(cacheUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      return {
        videos: [],
        error: errorData.error || 'Failed to fetch cached videos',
        fallbackUrl: `https://www.youtube.com/results?search_query=review+phim+${type}`,
      };
    }

    const data = await videosResponse.json();
    console.log(
      'DEBUG: First video from cache API:',
      data.items?.[0]
        ? {
            id: data.items[0].id,
            title: data.items[0].title?.substring(0, 30) + '...',
            duration: data.items[0].duration,
            keys: Object.keys(data.items[0]),
          }
        : 'No items'
    );
    return {
      videos: data.items || [], // data.items is already in VideoCardData format
    };
  } catch (error) {
    console.error(`Error fetching cached videos for ${type}:`, error);
    return {
      videos: [],
      error: 'Có lỗi xảy ra khi tải video review. Vui lòng thử lại sau.',
      fallbackUrl: `https://www.youtube.com/results?search_query=review+phim+${type}`,
    };
  }
}

export default async function HomePage() {
  // Use cached videos with random selection - get more than needed for filtering
  const [latestReviews, costumeDramaReviews, trailerVideos] = await Promise.all(
    [
      getCachedVideos('general', 32),
      getCachedVideos('costume_drama', 32),
      getCachedVideos('trailers', 32),
    ]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Latest Reviews */}
      <ClientVideoSection
        title="📺 Review Phim Mới Nhất"
        videos={latestReviews.videos}
        viewAllLink="/search?q=review+phim+2025"
        error={latestReviews.error}
        fallbackUrl={latestReviews.fallbackUrl}
        cacheType="general"
      />

      {/* Costume Drama Reviews */}
      <ClientVideoSection
        title="👑 Review Phim Cung Đấu"
        videos={costumeDramaReviews.videos}
        viewAllLink="/search?q=review+phim+cung+đấu"
        error={costumeDramaReviews.error}
        fallbackUrl={costumeDramaReviews.fallbackUrl}
        cacheType="costume_drama"
      />

      {/* Movie Trailers */}
      <ClientVideoSection
        title="🎥 Trailer Phim Mới Nhất"
        videos={trailerVideos.videos}
        viewAllLink="/search?q=trailer+phim+2025"
        error={trailerVideos.error}
        fallbackUrl={trailerVideos.fallbackUrl}
        cacheType="trailers"
      />
    </div>
  );
}
