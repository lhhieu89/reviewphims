import { NextRequest, NextResponse } from 'next/server';
import { videoCache } from '@/lib/video-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type =
      (searchParams.get('type') as 'general' | 'costume_drama' | 'trailers') ||
      'general';
    const count = parseInt(searchParams.get('count') || '16', 10);

    // Get random videos from cache
    let videos = videoCache.getRandomVideos(type, count);
    console.log(
      'DEBUG (Cache API): First video before refresh:',
      videos[0]
        ? {
            id: videos[0].id,
            title: videos[0].title?.substring(0, 30) + '...',
            duration: videos[0].duration,
            keys: Object.keys(videos[0]),
          }
        : 'No videos'
    );

    // If cache is empty or insufficient videos, try to fetch and cache
    if (videos.length < count) {
      console.log('DEBUG (Cache API): Not enough videos, fetching more...');
      await videoCache.fetchAndCacheVideos(type, 200);
      videos = videoCache.getRandomVideos(type, count);
      console.log(
        'DEBUG (Cache API): First video after refresh:',
        videos[0]
          ? {
              id: videos[0].id,
              title: videos[0].title?.substring(0, 30) + '...',
              duration: videos[0].duration,
              keys: Object.keys(videos[0]),
            }
          : 'No videos'
      );
    }

    return NextResponse.json(
      {
        items: videos,
        total: videos.length,
        type,
        fromCache: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Cache API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos from cache', items: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, videoId } = await request.json();

    if (action === 'mark_watched' && videoId) {
      // This will be handled on client side
      return NextResponse.json({ success: true });
    }

    if (action === 'initialize_cache') {
      await videoCache.initializeCache();
      return NextResponse.json({ success: true, message: 'Cache initialized' });
    }

    if (action === 'clear_cache') {
      videoCache.clearCache();
      return NextResponse.json({ success: true, message: 'Cache cleared' });
    }

    if (action === 'cache_status') {
      const status = videoCache.getCacheStatus();
      return NextResponse.json({ status });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cache POST API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process cache action' },
      { status: 500 }
    );
  }
}
