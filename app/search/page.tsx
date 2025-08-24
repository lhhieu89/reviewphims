import { Metadata } from 'next/types';
import { InfiniteVideoGrid } from '@/components/InfiniteVideoGrid';
import { SearchBarWrapper } from '@/components/SearchBarWrapper';
import { GenreFilter } from '@/components/GenreFilter';
import { env } from '@/lib/env';
import { formatNumber } from '@/lib/format';
import type {
  ListResponse,
  YouTubeSearchItem,
  VideoCardData,
} from '@/types/youtube';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';

  if (!query) {
    return {
      title: 'Tìm kiếm video',
      description: 'Tìm kiếm video phim yêu thích của bạn trên YouTube.',
      alternates: {
        canonical: '/search',
      },
    };
  }

  return {
    title: `Tìm kiếm: ${query}`,
    description: `Kết quả tìm kiếm cho "${query}". Khám phá những video phim liên quan đến từ khóa này.`,
    alternates: {
      canonical: `/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      title: `Tìm kiếm: ${query} | Review Phim`,
      description: `Kết quả tìm kiếm cho "${query}". Khám phá những video phim liên quan đến từ khóa này.`,
      url: `${env.SITE_URL}/search?q=${encodeURIComponent(query)}`,
    },
  };
}

async function searchVideos(query: string): Promise<{
  videos: VideoCardData[];
  nextPageToken?: string;
  totalResults?: number;
}> {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: '20',
    });

    const response = await fetch(
      `${env.SITE_URL}/api/youtube/search?${params.toString()}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search videos');
    }

    const data: ListResponse<YouTubeSearchItem> = await response.json();

    const videos: VideoCardData[] = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    }));

    return {
      videos,
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error('Error searching videos:', error);
    return {
      videos: [],
    };
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Tìm kiếm video
          </h1>
          <p className="text-muted-foreground mb-8">
            Nhập từ khóa để tìm kiếm video phim yêu thích của bạn
          </p>

          <div className="mb-8">
            <SearchBarWrapper className="max-w-md mx-auto" />
          </div>

          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground">
            Bắt đầu tìm kiếm để khám phá những video thú vị
          </p>
        </div>
      </div>
    );
  }

  const { videos, nextPageToken, totalResults } = await searchVideos(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Kết quả tìm kiếm cho &quot;{query}&quot;
            </h1>
            {totalResults && (
              <p className="text-muted-foreground hidden">
                Khoảng {formatNumber(totalResults)} kết quả
              </p>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mt-6">
          <GenreFilter />
        </div>
      </div>

      {videos.length > 0 ? (
        <InfiniteVideoGrid
          initialVideos={videos}
          initialNextPageToken={nextPageToken}
          query={query}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Không tìm thấy kết quả nào
          </h2>
          <p className="text-muted-foreground mb-4">
            Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
          </p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tìm trên YouTube
          </a>
        </div>
      )}
    </div>
  );
}
