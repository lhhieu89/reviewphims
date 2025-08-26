'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoCard } from './VideoCard';
import { VideoSkeleton } from './VideoSkeleton';
import type { VideoCardData } from '@/types/youtube';

interface InfiniteVideoGridProps {
  initialVideos: VideoCardData[];
  initialNextPageToken?: string;
  query: string;
  className?: string;
}

export function InfiniteVideoGrid({
  initialVideos,
  initialNextPageToken,
  query,
  className = '',
}: InfiniteVideoGridProps) {
  const [videos, setVideos] = useState<VideoCardData[]>(initialVideos);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    initialNextPageToken
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadMoreVideos = useCallback(async () => {
    if (isLoadingRef.current || loading || !nextPageToken || !hasMore) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: '20',
        pageToken: nextPageToken,
      });

      const response = await fetch(`/api/youtube/search?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(
            'YouTube API quota exceeded. Please try again later.'
          );
        }
        throw new Error('Failed to load more videos');
      }

      const data = await response.json();

      const newVideos: VideoCardData[] = data.items
        .map((item: any) => ({
          // Handle both API and crawler response structures
          id: typeof item.id === 'string' ? item.id : item.id?.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          // Include duration and viewCount if available (from crawler)
          duration: item.contentDetails?.duration,
          viewCount: item.statistics?.viewCount,
        }))
        .filter((video: VideoCardData) => video.id); // Filter out videos with undefined IDs

      // Filter out duplicates based on video ID
      setVideos((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id));
        return [...prev, ...uniqueNewVideos];
      });

      // Update pagination
      if (data.nextPageToken) {
        setNextPageToken(data.nextPageToken);
      } else {
        setHasMore(false);
        setNextPageToken(undefined);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('quota')) {
        setError('YouTube API quota exceeded. Please try again later.');
        setHasMore(false);
      } else {
        setError('Không thể tải thêm video. Vui lòng thử lại.');
      }
      console.error('Error loading more videos:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [loading, nextPageToken, query, hasMore]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          !isLoadingRef.current &&
          !loading &&
          nextPageToken &&
          hasMore
        ) {
          // Debounce to prevent multiple rapid calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadMoreVideos();
          }, 500);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const currentRef = observerRef.current;
    if (currentRef && hasMore) {
      observer.observe(currentRef);
    }

    return () => {
      clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreVideos, loading, nextPageToken, hasMore]);

  // Reset videos when query changes
  useEffect(() => {
    setVideos(initialVideos);
    setNextPageToken(initialNextPageToken);
    setHasMore(!!initialNextPageToken);
    setError(null);
  }, [initialVideos, initialNextPageToken, query]);

  return (
    <div className={className}>
      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <VideoCard key={`${video.id}-${index}`} video={video} />
        ))}
      </div>

      {/* Loading state for infinite scroll */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <VideoSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          {!error.includes('quota') && (
            <button
              onClick={() => loadMoreVideos()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && videos.length > 0 && !loading && !error && (
        <div className="text-center py-8 hidden">
          <p className="text-muted-foreground">
            🎬 Bạn đã xem hết tất cả video cho tìm kiếm này!
          </p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !error && <div ref={observerRef} className="h-4" />}
    </div>
  );
}
