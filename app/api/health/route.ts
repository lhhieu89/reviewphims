import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      version: process.env.npm_package_version || '1.0.0',
      youtube_api: 'not_configured' as string,
    };

    // Test YouTube API connection (optional)
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      health.youtube_api = 'configured';
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Support HEAD requests for load balancer health checks
export async function HEAD() {
  return new Response(null, { status: 200 });
}
