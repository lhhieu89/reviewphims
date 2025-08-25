'use client';

import { useEffect, useState } from 'react';
import { VideoCardData } from '@/types/youtube';
import { ReviewSection } from './ReviewSection';

interface WatchedVideos {
  videoIds: string[];
  timestamp: number;
}

interface ClientVideoSectionProps {
  title: string;
  videos: VideoCardData[];
  viewAllLink: string;
  error?: string;
  fallbackUrl?: string;
  cacheType?: 'general' | 'costume_drama' | 'trailers';
}

const WATCHED_COOKIE_NAME = 'watched_videos';
const TARGET_VIDEO_COUNT = 16;

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

async function fetchMoreVideosFromCache(
  cacheType: string,
  count: number
): Promise<VideoCardData[]> {
  try {
    const response = await fetch(
      `/api/cache/videos?type=${cacheType}&count=${count}`
    );
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching more videos from cache:', error);
    return [];
  }
}

export function ClientVideoSection({
  title,
  videos,
  viewAllLink,
  error,
  fallbackUrl,
  cacheType = 'general',
}: ClientVideoSectionProps) {
  const [filteredVideos, setFilteredVideos] = useState<VideoCardData[]>(videos);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const ensureEnoughVideos = async () => {
      const watchedIds = getWatchedVideoIds();

      if (watchedIds.length === 0) {
        setFilteredVideos(videos.slice(0, TARGET_VIDEO_COUNT));
        return;
      }

      // Filter out watched videos
      let unwatchedVideos = videos.filter(
        (video) => !watchedIds.includes(video.id)
      );

      // If we don't have enough videos, fetch more from cache
      if (unwatchedVideos.length < TARGET_VIDEO_COUNT) {
        setIsLoadingMore(true);
        try {
          // Fetch more videos from cache - get more than needed to account for more watched videos
          const additionalCount = Math.max(32, TARGET_VIDEO_COUNT * 2);
          const moreVideos = await fetchMoreVideosFromCache(cacheType, additionalCount);
          
          // Add new videos that aren't already in our list and aren't watched
          const existingIds = new Set(videos.map(v => v.id));
          const newUnwatchedVideos = moreVideos.filter(
            video => !existingIds.has(video.id) && !watchedIds.includes(video.id)
          );
          
          // Combine and take up to TARGET_VIDEO_COUNT
          unwatchedVideos = [...unwatchedVideos, ...newUnwatchedVideos]
            .slice(0, TARGET_VIDEO_COUNT);
        } catch (error) {
          console.error('Error fetching additional videos:', error);
        } finally {
          setIsLoadingMore(false);
        }
      } else {
        // We have enough, just take the target count
        unwatchedVideos = unwatchedVideos.slice(0, TARGET_VIDEO_COUNT);
      }

      setFilteredVideos(unwatchedVideos);
    };

    ensureEnoughVideos();
  }, [videos, cacheType]);

  return (
    <ReviewSection
      title={title}
      videos={filteredVideos}
      viewAllLink={viewAllLink}
      error={error || (isLoadingMore ? 'Đang tải thêm video...' : undefined)}
      fallbackUrl={fallbackUrl}
    />
  );
}
