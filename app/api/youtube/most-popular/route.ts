import { NextRequest, NextResponse } from 'next/server';
import { listMostPopular } from '@/lib/youtube';
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
    const regionCode = searchParams.get('region') || undefined;
    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!, 10)
      : undefined;
    const pageToken = searchParams.get('pageToken') || undefined;
    const videoCategoryId = searchParams.get('videoCategoryId') || undefined;

    const data = await listMostPopular({
      regionCode,
      maxResults,
      pageToken,
      videoCategoryId,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error) {
    console.error('YouTube API Error:', error);

    // Vẫn trả về lỗi nếu không phải lỗi quota (lỗi quota đã được xử lý trong lib/youtube.ts)
    return NextResponse.json(
      { error: 'Failed to fetch popular videos' },
      { status: 500 }
    );
  }
}
