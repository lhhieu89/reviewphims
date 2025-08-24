import { env } from './env';
import type {
  YouTubeVideo,
  YouTubeSearchItem,
  YouTubeChannel,
  ListResponse,
  YouTubeError,
} from '@/types/youtube';
import {
  crawlVideoById,
  crawlSearchVideos,
  crawlMostPopular,
} from './youtube-crawler';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeApiError extends Error {
  status?: number;
  code?: string;
}

class YouTubeApiError extends Error {
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'YouTubeApiError';
    this.status = status;
    this.code = code;
  }
}

async function fetchYouTubeApi<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);

  // Add API key and common parameters
  url.searchParams.set('key', env.YOUTUBE_API_KEY);

  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      const errorData: YouTubeError = await response.json();
      const message = errorData.error?.message || 'YouTube API error';
      const code =
        errorData.error?.code?.toString() || response.status.toString();

      throw new YouTubeApiError(message, response.status, code);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      throw error;
    }

    throw new YouTubeApiError(
      `Failed to fetch from YouTube API: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Kiểm tra xem có phải lỗi hết quota không
function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof YouTubeApiError &&
    (error.status === 403 || error.code === '403') &&
    error.message.toLowerCase().includes('quota')
  );
}

export interface ListMostPopularParams {
  regionCode?: string;
  maxResults?: number;
  pageToken?: string;
  videoCategoryId?: string;
}

export async function listMostPopular({
  regionCode = env.YOUTUBE_REGION_CODE,
  maxResults = 20,
  pageToken,
  videoCategoryId,
}: ListMostPopularParams = {}): Promise<ListResponse<YouTubeVideo>> {
  const params: Record<string, string> = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode,
    maxResults: maxResults.toString(),
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  if (videoCategoryId) {
    params.videoCategoryId = videoCategoryId;
  }

  try {
    return await fetchYouTubeApi<ListResponse<YouTubeVideo>>('videos', params);
  } catch (error) {
    // Nếu hết quota API, sử dụng phương pháp crawl
    if (isQuotaExceededError(error)) {
      console.log('YouTube API quota exceeded, falling back to web crawler');
      return await crawlMostPopular(maxResults);
    }
    throw error;
  }
}

export interface SearchVideosParams {
  q: string;
  maxResults?: number;
  pageToken?: string;
  regionCode?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
  videoCategoryId?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  safeSearch?: 'none' | 'moderate' | 'strict';
  relevanceLanguage?: string;
  videoEmbeddable?: 'true' | 'any';
}

export async function searchVideos({
  q,
  maxResults = 20,
  pageToken,
  regionCode = env.YOUTUBE_REGION_CODE,
  order = 'relevance',
  videoCategoryId,
  videoDuration,
  safeSearch = 'moderate',
  relevanceLanguage = 'vi',
  videoEmbeddable = 'true',
}: SearchVideosParams): Promise<ListResponse<YouTubeSearchItem>> {
  const params: Record<string, string> = {
    part: 'snippet',
    type: 'video',
    q: q,
    maxResults: maxResults.toString(),
    regionCode,
    order,
    safeSearch,
    relevanceLanguage,
    videoEmbeddable,
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  if (videoCategoryId) {
    params.videoCategoryId = videoCategoryId;
  }

  if (videoDuration) {
    params.videoDuration = videoDuration;
  }

  try {
    return await fetchYouTubeApi<ListResponse<YouTubeSearchItem>>(
      'search',
      params
    );
  } catch (error) {
    // Nếu hết quota API, sử dụng phương pháp crawl
    if (isQuotaExceededError(error)) {
      console.log('YouTube API quota exceeded, falling back to web crawler');
      return await crawlSearchVideos(q, maxResults);
    }
    throw error;
  }
}

export interface GetVideoByIdParams {
  id: string;
}

export async function getVideoById({
  id,
}: GetVideoByIdParams): Promise<YouTubeVideo | null> {
  const params: Record<string, string> = {
    part: 'snippet,contentDetails,statistics',
    id,
  };

  try {
    const response = await fetchYouTubeApi<ListResponse<YouTubeVideo>>(
      'videos',
      params
    );
    return response.items[0] || null;
  } catch (error) {
    // Nếu hết quota API, sử dụng phương pháp crawl
    if (isQuotaExceededError(error)) {
      console.log('YouTube API quota exceeded, falling back to web crawler');
      return await crawlVideoById(id);
    }
    throw error;
  }
}

export interface GetChannelByIdParams {
  id: string;
}

export async function getChannelById({
  id,
}: GetChannelByIdParams): Promise<YouTubeChannel | null> {
  const params: Record<string, string> = {
    part: 'snippet,statistics',
    id,
  };

  const response = await fetchYouTubeApi<ListResponse<YouTubeChannel>>(
    'channels',
    params
  );

  return response.items[0] || null;
}

// Related videos functionality removed to save requests as requested

export { YouTubeApiError };
