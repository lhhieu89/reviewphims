export interface YouTubeVideo {
  kind: 'youtube#video';
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage?: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: Record<string, unknown>;
    projection: string;
  };
  statistics?: {
    viewCount: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount: string;
    commentCount?: string;
  };
}

export interface YouTubeSearchItem {
  kind: 'youtube#searchResult';
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeChannel {
  kind: 'youtube#channel';
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: YouTubeThumbnails;
    localized: {
      title: string;
      description: string;
    };
    country?: string;
  };
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface ListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: PageInfo;
  items: T[];
  isCrawlerData?: boolean; // Flag to indicate if data comes from crawler
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface VideoCardData {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  thumbnails: YouTubeThumbnails;
  duration?: string;
  description?: string;
  channelId?: string;
  categoryId?: string;
  liveBroadcastContent?: string;
  localized?: {
    title: string;
    description: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: Record<string, unknown>;
    projection: string;
  };
  statistics?: {
    viewCount: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount: string;
    commentCount?: string;
  };
}
