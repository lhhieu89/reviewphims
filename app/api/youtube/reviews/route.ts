import { NextRequest, NextResponse } from 'next/server';
import { searchVideos, YouTubeApiError } from '@/lib/youtube';
import { rateLimiter } from '@/lib/rate-limiter';
import {
  REVIEW_KEYWORDS,
  getRandomKeyword,
  getMixedKeywords,
  YOUTUBE_CATEGORIES,
} from '@/lib/review-keywords';

export async function GET(request: NextRequest) {
  // Rate limiting
  const { allowed, remaining } = rateLimiter.checkLimit(request);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': '60',
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'mixed'; // general, costume_drama, international, genres, trailers, mixed
    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!, 10)
      : 12;

    let searchQuery: string;

    // Choose search strategy based on type
    switch (type) {
      case 'general':
        searchQuery = getRandomKeyword('general');
        break;
      case 'costume_drama':
        searchQuery = getRandomKeyword('costume_drama');
        break;
      case 'international':
        // Fallback to general for international
        searchQuery = getRandomKeyword('general');
        break;
      case 'genres':
        // Fallback to general for genres
        searchQuery = getRandomKeyword('general');
        break;
      case 'trailers':
        searchQuery = getRandomKeyword('trailers');
        break;
      case 'mixed':
      default:
        // Use single random keyword from mixed categories to save quota
        const keywords = getMixedKeywords();
        const randomKeyword =
          keywords[Math.floor(Math.random() * keywords.length)];
        searchQuery = randomKeyword;
        break;
    }

    // Single keyword search
    const data = await searchVideos({
      q: searchQuery,
      maxResults,
      order: 'relevance', // Use relevance instead of date
      regionCode: 'VN',
    });

    return NextResponse.json(
      {
        ...data,
        searchQuery,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('YouTube Reviews API Error:', error);

    // Vẫn trả về lỗi nếu không phải lỗi quota (lỗi quota đã được xử lý trong lib/youtube.ts)
    return NextResponse.json(
      {
        error: 'Failed to fetch review videos. Please try again later.',
        fallbackUrl: 'https://www.youtube.com/results?search_query=review+phim',
      },
      { status: 500 }
    );
  }
}
