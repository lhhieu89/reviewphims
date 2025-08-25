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

export function ClientVideoSection({
  title,
  videos,
  viewAllLink,
  error,
  fallbackUrl,
}: ClientVideoSectionProps) {
  const [filteredVideos, setFilteredVideos] = useState<VideoCardData[]>(videos);

  useEffect(() => {
    const watchedIds = getWatchedVideoIds();

    if (watchedIds.length === 0) {
      setFilteredVideos(videos);
      return;
    }

    // Filter out watched videos
    const unwatchedVideos = videos.filter(
      (video) => !watchedIds.includes(video.id)
    );
    setFilteredVideos(unwatchedVideos);
  }, [videos]);

  return (
    <ReviewSection
      title={title}
      videos={filteredVideos}
      viewAllLink={viewAllLink}
      error={error}
      fallbackUrl={fallbackUrl}
    />
  );
}
