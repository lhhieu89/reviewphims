import { NextRequest, NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube';
import { rateLimiter } from '@/lib/rate-limiter';

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
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!, 10)
      : undefined;
    const pageToken = searchParams.get('pageToken') || undefined;
    const regionCode = searchParams.get('regionCode') || undefined;

    const data = await searchVideos({
      q,
      maxResults,
      pageToken,
      regionCode,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error) {
    console.error('YouTube Search API Error:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      const query = new URL(request.url).searchParams.get('q');
      return NextResponse.json(
        {
          error: 'YouTube API quota exceeded. Please try again later.',
          fallbackUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query || '')}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    );
  }
}
