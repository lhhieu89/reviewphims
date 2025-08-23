import { NextRequest, NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube';
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
        // Use multiple searches and combine results
        const keywords = getMixedKeywords();
        const resultsPerKeyword = Math.ceil(maxResults / keywords.length);

        const searchPromises = keywords.map((keyword) =>
          searchVideos({
            q: keyword,
            maxResults: resultsPerKeyword,
            order: 'relevance', // Use relevance instead of date
            regionCode: 'VN',
          })
        );

        const results = await Promise.all(searchPromises);

        // Combine and shuffle results
        const allVideos = results.flatMap((result) => result.items || []);
        const shuffled = allVideos.sort(() => Math.random() - 0.5);

        return NextResponse.json(
          {
            items: shuffled.slice(0, maxResults),
            kind: 'youtube#searchListResponse',
            pageInfo: {
              totalResults: shuffled.length,
              resultsPerPage: maxResults,
            },
            searchQuery: keywords.join(', '),
          },
          {
            headers: {
              'Cache-Control':
                'public, s-maxage=300, stale-while-revalidate=600',
              'X-RateLimit-Remaining': remaining.toString(),
            },
          }
        );
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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('YouTube Reviews API Error:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        {
          error: 'YouTube API quota exceeded. Please try again later.',
          fallbackUrl:
            'https://www.youtube.com/results?search_query=review+phim+2025',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch review videos. Please try again later.',
        fallbackUrl: 'https://www.youtube.com/results?search_query=review+phim',
      },
      { status: 500 }
    );
  }
}
