import { VideoCardData, YouTubeSearchItem } from '@/types/youtube';
import { searchVideos } from '@/lib/youtube';
import { getRandomKeyword } from '@/lib/review-keywords';

interface CacheData {
  videos: VideoCardData[];
  timestamp: number;
}

interface WatchedVideos {
  videoIds: string[];
  timestamp: number;
}

class VideoCache {
  private cache = new Map<string, CacheData>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly WATCHED_COOKIE_NAME = 'watched_videos';

  // Helper to convert API response to VideoCardData
  private convertToVideoCardData(item: YouTubeSearchItem): VideoCardData {
    return {
      id: typeof item.id === 'string' ? item.id : item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    };
  }

  // Get watched video IDs from cookies (for browser environment)
  private getWatchedVideoIds(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(this.WATCHED_COOKIE_NAME + '='));

      if (!cookieValue) return [];

      const data: WatchedVideos = JSON.parse(
        decodeURIComponent(cookieValue.split('=')[1])
      );

      // Check if data is expired (older than 30 days)
      if (Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
        this.clearWatchedVideos();
        return [];
      }

      return data.videoIds || [];
    } catch {
      return [];
    }
  }

  // Add video to watched list
  public markAsWatched(videoId: string): void {
    if (typeof window === 'undefined') return;

    const watchedIds = this.getWatchedVideoIds();
    if (watchedIds.includes(videoId)) return;

    const updatedIds = [...watchedIds, videoId].slice(-100); // Keep only last 100 watched videos
    const data: WatchedVideos = {
      videoIds: updatedIds,
      timestamp: Date.now(),
    };

    document.cookie = `${this.WATCHED_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }

  // Clear watched videos
  public clearWatchedVideos(): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${this.WATCHED_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Filter out watched videos
  private filterWatchedVideos(videos: VideoCardData[]): VideoCardData[] {
    const watchedIds = this.getWatchedVideoIds();
    return videos.filter((video) => !watchedIds.includes(video.id));
  }

  // Fetch and cache videos for a specific type
  async fetchAndCacheVideos(
    type: 'general' | 'costume_drama' | 'trailers',
    maxResults: number = 200
  ): Promise<VideoCardData[]> {
    const cacheKey = `${type}:${maxResults}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.videos;
    }

    try {
      // Fetch videos from API
      const searchQuery = getRandomKeyword(type);
      const response = await searchVideos({
        q: searchQuery,
        maxResults,
        order: 'relevance',
        regionCode: 'VN',
      });

      const videos =
        response.items?.map((item) => this.convertToVideoCardData(item)) || [];

      // Cache the results
      this.cache.set(cacheKey, {
        videos,
        timestamp: Date.now(),
      });

      return videos;
    } catch (error) {
      console.error(`Error fetching videos for ${type}:`, error);

      // Return cached data even if expired, or empty array
      if (cached) {
        return cached.videos;
      }
      return [];
    }
  }

  // Get random videos from cache (no filtering - handled client-side)
  getRandomVideos(
    type: 'general' | 'costume_drama' | 'trailers',
    count: number
  ): VideoCardData[] {
    const cacheKey = `${type}:200`; // Default to 200 max results cache
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return [];
    }

    // Shuffle and return random selection (no watched video filtering on server)
    const shuffled = [...cached.videos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get cache status
  getCacheStatus(): Record<
    string,
    { count: number; lastUpdated: Date; isExpired: boolean }
  > {
    const status: Record<
      string,
      { count: number; lastUpdated: Date; isExpired: boolean }
    > = {};

    this.cache.forEach((data, key) => {
      status[key] = {
        count: data.videos.length,
        lastUpdated: new Date(data.timestamp),
        isExpired: Date.now() - data.timestamp >= this.CACHE_TTL,
      };
    });

    return status;
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }

  // Initialize cache for all types (should be called on app startup)
  async initializeCache(): Promise<void> {
    try {
      await Promise.all([
        this.fetchAndCacheVideos('general', 200),
        this.fetchAndCacheVideos('costume_drama', 200),
        this.fetchAndCacheVideos('trailers', 200),
      ]);
      console.log('Video cache initialized successfully');
    } catch (error) {
      console.error('Failed to initialize video cache:', error);
    }
  }
}

// Export singleton instance
export const videoCache = new VideoCache();
