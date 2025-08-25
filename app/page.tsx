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
export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Review Phim - Xem Review Phim Mới Nhất 2025',
  description:
    'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim được đánh giá cao.',
  alternates: {
    canonical: '/',
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
  item: YouTubeVideo | YouTubeSearchItem
): VideoCardData {
  if ('statistics' in item) {
    // YouTubeVideo
    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount,
      thumbnails: item.snippet.thumbnails,
      duration: item.contentDetails?.duration,
    };
  } else {
    // YouTubeSearchItem
    return {
      id: typeof item.id === 'string' ? item.id : item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    };
  }
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
    const response = await fetch(
      `${env.SITE_URL}/api/cache/videos?type=${type}&count=${count}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        videos: [],
        error: errorData.error || 'Failed to fetch cached videos',
        fallbackUrl: `https://www.youtube.com/results?search_query=review+phim+${type}`,
      };
    }

    const data = await response.json();
    return {
      videos: data.items || [],
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
  // Use cached videos with random selection
  const [latestReviews, costumeDramaReviews, trailerVideos] = await Promise.all(
    [
      getCachedVideos('general', 16),
      getCachedVideos('costume_drama', 16),
      getCachedVideos('trailers', 16),
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
      />

      {/* Costume Drama Reviews */}
      <ClientVideoSection
        title="👑 Review Phim Cung Đấu"
        videos={costumeDramaReviews.videos}
        viewAllLink="/search?q=review+phim+cung+đấu"
        error={costumeDramaReviews.error}
        fallbackUrl={costumeDramaReviews.fallbackUrl}
      />

      {/* Movie Trailers */}
      <ClientVideoSection
        title="🎥 Trailer Phim Mới Nhất"
        videos={trailerVideos.videos}
        viewAllLink="/search?q=trailer+phim+2025"
        error={trailerVideos.error}
        fallbackUrl={trailerVideos.fallbackUrl}
      />
    </div>
  );
}
