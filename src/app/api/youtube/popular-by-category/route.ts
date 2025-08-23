import { NextRequest, NextResponse } from 'next/server';
import { listMostPopular } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

// Rate limiting
const REQUEST_LIMIT = 100; // requests per minute
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }

  if (record.count >= REQUEST_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// YouTube video categories for different content types
const CATEGORY_MAPPING = {
  general: '24', // Entertainment
  costume_drama: '24', // Entertainment
  trailers: '1', // Film & Animation
  entertainment: '24', // Entertainment
  film: '1', // Film & Animation
} as const;

export async function GET(request: NextRequest) {
  const ip = request.ip || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'general';
    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!, 10)
      : 12;

    // Get the appropriate video category
    const videoCategoryId =
      CATEGORY_MAPPING[type as keyof typeof CATEGORY_MAPPING] || '24';

    // Use mostPopular API like YouTube's trending
    const data = await listMostPopular({
      videoCategoryId,
      maxResults,
      regionCode: 'VN',
    });

    return NextResponse.json(
      {
        ...data,
        categoryType: type,
        videoCategoryId,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error in popular-by-category API:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch popular videos';
    const fallbackUrl = 'https://www.youtube.com/feed/trending';

    return NextResponse.json(
      {
        error: errorMessage,
        fallbackUrl,
        items: [],
        kind: 'youtube#videoListResponse',
        etag: '',
        pageInfo: { totalResults: 0, resultsPerPage: 0 },
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      }
    );
  }
}
