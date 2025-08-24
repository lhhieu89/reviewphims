import { Metadata } from 'next';
import {
  ListResponse,
  YouTubeVideo,
  YouTubeSearchItem,
  VideoCardData,
} from '@/types/youtube';
import { ReviewSection } from '@/components/ReviewSection';
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

// Cache cho các request API
const cache = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getReviewVideos(
  type: string = 'general',
  maxResults: number = 8
): Promise<{
  videos: VideoCardData[];
  error?: string;
  fallbackUrl?: string;
}> {
  // Kiểm tra cache
  const cacheKey = `reviews:${type}:${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${env.SITE_URL}/api/youtube/reviews?type=${type}&maxResults=${maxResults}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const result = {
        videos: [],
        error: errorData.error || 'Failed to fetch review videos',
        fallbackUrl: errorData.fallbackUrl,
      };

      // Lưu vào cache ngay cả khi có lỗi để tránh request liên tục
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    }

    const data: ListResponse<YouTubeSearchItem> = await response.json();
    const result = {
      videos: data.items?.map(convertToVideoCardData) || [],
    };

    // Lưu vào cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error(`Error fetching ${type} review videos:`, error);
    const result = {
      videos: [],
      error: 'Có lỗi xảy ra khi tải video review. Vui lòng thử lại sau.',
      fallbackUrl: `https://www.youtube.com/results?search_query=review+phim+${type}`,
    };

    // Lưu vào cache ngay cả khi có lỗi
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }
}

export default async function HomePage() {
  // Fetch different types of review content
  const [latestReviews, costumeDramaReviews, trailerVideos] = await Promise.all(
    [
      getReviewVideos('general', 16),
      getReviewVideos('costume_drama', 16),
      getReviewVideos('trailers', 16),
    ]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Latest Reviews */}
      <ReviewSection
        title="📺 Review Phim Mới Nhất"
        videos={latestReviews.videos}
        viewAllLink="/search?q=review+phim+2025"
        error={latestReviews.error}
        fallbackUrl={latestReviews.fallbackUrl}
      />

      {/* Costume Drama Reviews */}
      <ReviewSection
        title="👑 Review Phim Cung Đấu"
        videos={costumeDramaReviews.videos}
        viewAllLink="/search?q=review+phim+cung+đấu"
        error={costumeDramaReviews.error}
        fallbackUrl={costumeDramaReviews.fallbackUrl}
      />

      {/* Movie Trailers */}
      <ReviewSection
        title="🎥 Trailer Phim Mới Nhất"
        videos={trailerVideos.videos}
        viewAllLink="/search?q=trailer+phim+2025"
        error={trailerVideos.error}
        fallbackUrl={trailerVideos.fallbackUrl}
      />
    </div>
  );
}
