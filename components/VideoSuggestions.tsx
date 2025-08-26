'use client';

import { useEffect, useState } from 'react';
import { VideoGrid } from './VideoGrid';
import type { VideoCardData } from '@/types/youtube';

interface VideoSuggestionsProps {
  currentVideoId: string;
  className?: string;
}

interface WatchedVideos {
  videoIds: string[];
  timestamp: number;
}

const WATCHED_COOKIE_NAME = 'watched_videos';

function getWatchedVideoIds(): string[] {
  try {
    if (typeof document === 'undefined') return [];

    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(WATCHED_COOKIE_NAME + '='));

    if (!cookieValue) return [];

    const data: WatchedVideos = JSON.parse(
      decodeURIComponent(cookieValue.split('=')[1])
    );

    // Check if data is not expired (older than 30 days)
    if (Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
      return [];
    }

    return data.videoIds || [];
  } catch (error) {
    console.error('Error reading watched videos:', error);
    return [];
  }
}

export function VideoSuggestions({
  currentVideoId,
  className = '',
}: VideoSuggestionsProps) {
  const [videos, setVideos] = useState<VideoCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        setLoading(true);
        setError(null);

        // Get watched video IDs
        const watchedIds = getWatchedVideoIds();
        const targetCount = 20;
        let allFilteredVideos: VideoCardData[] = [];

        // Try to get enough videos by fetching in batches
        let fetchCount = 50; // Start with more videos
        let attempts = 0;
        const maxAttempts = 3;

        while (
          allFilteredVideos.length < targetCount &&
          attempts < maxAttempts
        ) {
          const response = await fetch(
            `/api/cache/videos?type=general&count=${fetchCount}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
          }

          const data = await response.json();
          const fetchedVideos = data.items || [];

          // Filter out current video and watched videos
          const newFilteredVideos = fetchedVideos.filter(
            (video: VideoCardData) =>
              video.id !== currentVideoId &&
              !watchedIds.includes(video.id) &&
              !allFilteredVideos.some((existing) => existing.id === video.id)
          );

          allFilteredVideos = [...allFilteredVideos, ...newFilteredVideos];

          // Increase fetch count for next attempt if needed
          fetchCount = Math.min(100, fetchCount * 1.5);
          attempts++;
        }

        // Take only the target count
        const finalVideos = allFilteredVideos.slice(0, targetCount);
        setVideos(finalVideos);
      } catch (err) {
        console.error('Error fetching video suggestions:', err);
        setError('Không thể tải video gợi ý');
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [currentVideoId]);

  if (loading) {
    return (
      <section className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-foreground">🎬 Video gợi ý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-video bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-foreground">🎬 Video gợi ý</h2>
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground">
            Không thể tải video gợi ý
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-foreground">🎬 Video gợi ý</h2>
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">🎬</div>
          <h3 className="text-xl font-semibold text-foreground">
            Chưa có video gợi ý
          </h3>
          <p className="text-muted-foreground">
            Hiện tại chưa có video gợi ý nào.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-foreground">🎬 Video gợi ý</h2>
      <VideoGrid videos={videos} showChannel={true} />
    </section>
  );
}
