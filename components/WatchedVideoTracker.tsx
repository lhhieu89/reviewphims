'use client';

import { useEffect } from 'react';

interface WatchedVideoTrackerProps {
  videoId: string;
}

interface WatchedVideos {
  videoIds: string[];
  timestamp: number;
}

const WATCHED_COOKIE_NAME = 'watched_videos';

export function WatchedVideoTracker({ videoId }: WatchedVideoTrackerProps) {
  useEffect(() => {
    const markAsWatched = () => {
      try {
        // Get existing watched videos
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(WATCHED_COOKIE_NAME + '='));
        
        let watchedIds: string[] = [];
        
        if (cookieValue) {
          const data: WatchedVideos = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
          
          // Check if data is not expired (older than 30 days)
          if (Date.now() - data.timestamp <= 30 * 24 * 60 * 60 * 1000) {
            watchedIds = data.videoIds || [];
          }
        }
        
        // Add current video if not already watched
        if (!watchedIds.includes(videoId)) {
          const updatedIds = [...watchedIds, videoId].slice(-100); // Keep only last 100 watched videos
          const data: WatchedVideos = {
            videoIds: updatedIds,
            timestamp: Date.now()
          };
          
          document.cookie = `${WATCHED_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }
      } catch (error) {
        console.error('Error marking video as watched:', error);
      }
    };

    // Mark as watched after a delay to ensure user actually started watching
    const timer = setTimeout(markAsWatched, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, [videoId]);

  // This component doesn't render anything
  return null;
}