import { NextRequest, NextResponse } from 'next/server';
import { getVideoById } from '@/lib/youtube';
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const data = await getVideoById({ id });

    if (!data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error) {
    console.error('YouTube Video API Error:', error);

    if (error instanceof Error && error.message.includes('quota')) {
      const videoId = new URL(request.url).searchParams.get('id');
      return NextResponse.json(
        {
          error: 'YouTube API quota exceeded. Please try again later.',
          fallbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch video details' },
      { status: 500 }
    );
  }
}
