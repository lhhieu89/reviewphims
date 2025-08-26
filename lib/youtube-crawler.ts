import { JSDOM } from 'jsdom';
import type {
  YouTubeVideo,
  YouTubeSearchItem,
  ListResponse,
  YouTubeThumbnails,
} from '@/types/youtube';

// Các user agent để giả lập trình duyệt
// Danh sách 10 user agent cho mỗi loại (pc & mobile)
const USER_AGENTS = {
  pc: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.70 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/18.19041',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  ],
  mobile: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.234 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.134 Mobile Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.70 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; Mi 9T Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  ],
};

/**
 * Lấy một user agent ngẫu nhiên từ danh sách
 */
function getRandomUserAgent(type: 'pc' | 'mobile' = 'pc'): string {
  const agents = USER_AGENTS[type];
  return agents[Math.floor(Math.random() * agents.length)];
}

// Cache cho các request
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Lấy dữ liệu HTML từ một URL với cache
 */
async function fetchHTML(url: string): Promise<Document | null> {
  // Kiểm tra cache
  const cacheKey = `html:${url}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Lưu vào cache
    cache.set(cacheKey, {
      data: document,
      timestamp: Date.now(),
    });

    return document;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Trích xuất dữ liệu ytInitialData từ HTML
 */
function extractYtInitialData(document: Document): any {
  try {
    // Tìm script chứa ytInitialData
    const scripts = document.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = scripts[i].textContent || '';
      if (scriptContent.includes('ytInitialData')) {
        // Sử dụng regex mạnh hơn để bắt JSON object
        const regex = /var\s+ytInitialData\s*=\s*({.+?});/s;
        const match = scriptContent.match(regex);
        if (match && match[1]) {
          try {
            return JSON.parse(match[1]);
          } catch (parseError) {
            console.error('Error parsing ytInitialData JSON:', parseError);
            // Thử cách khác nếu JSON.parse thất bại
            const altRegex = /ytInitialData\s*=\s*({.+?});/s;
            const altMatch = scriptContent.match(altRegex);
            if (altMatch && altMatch[1]) {
              return JSON.parse(altMatch[1]);
            }
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting ytInitialData:', error);
    return null;
  }
}

/**
 * Chuyển đổi thời gian đăng tải sang timestamp
 */
function parsePublishedTime(publishedAtText: string | null): string {
  if (!publishedAtText) return new Date().toISOString();

  const now = new Date();

  // Xử lý các định dạng thời gian tiếng Việt
  if (publishedAtText.includes('giây')) {
    const seconds = parseInt(publishedAtText.match(/(\d+)\s+giây/)?.[1] || '0');
    now.setSeconds(now.getSeconds() - seconds);
  } else if (publishedAtText.includes('phút')) {
    const minutes = parseInt(publishedAtText.match(/(\d+)\s+phút/)?.[1] || '0');
    now.setMinutes(now.getMinutes() - minutes);
  } else if (publishedAtText.includes('giờ')) {
    const hours = parseInt(publishedAtText.match(/(\d+)\s+giờ/)?.[1] || '0');
    now.setHours(now.getHours() - hours);
  } else if (publishedAtText.includes('ngày')) {
    const days = parseInt(publishedAtText.match(/(\d+)\s+ngày/)?.[1] || '0');
    now.setDate(now.getDate() - days);
  } else if (publishedAtText.includes('tuần')) {
    const weeks = parseInt(publishedAtText.match(/(\d+)\s+tuần/)?.[1] || '0');
    now.setDate(now.getDate() - weeks * 7);
  } else if (publishedAtText.includes('tháng')) {
    const months = parseInt(publishedAtText.match(/(\d+)\s+tháng/)?.[1] || '0');
    now.setMonth(now.getMonth() - months);
  } else if (publishedAtText.includes('năm')) {
    const years = parseInt(publishedAtText.match(/(\d+)\s+năm/)?.[1] || '0');
    now.setFullYear(now.getFullYear() - years);
  }

  return now.toISOString();
}

/**
 * Chuyển đổi định dạng thời lượng video
 */
function formatDuration(durationText: string | null): string {
  if (!durationText) return 'PT0S';

  // Nếu đã ở định dạng ISO 8601 thì trả về nguyên bản
  if (durationText.startsWith('PT')) {
    return durationText;
  }

  // Chuyển đổi từ "HH:MM:SS" sang "PTHMS"
  const parts = durationText.split(':').map((part) => parseInt(part));
  let duration = 'PT';

  if (parts.length === 3) {
    duration += `${parts[0]}H${parts[1]}M${parts[2]}S`;
  } else if (parts.length === 2) {
    duration += `${parts[0]}M${parts[1]}S`;
  } else if (parts.length === 1) {
    duration += `${parts[0]}S`;
  }

  return duration;
}

/**
 * Tạo thumbnails từ video ID
 */
function createThumbnails(videoId: string): YouTubeThumbnails {
  return {
    default: {
      url: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      width: 120,
      height: 90,
    },
    medium: {
      url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      width: 320,
      height: 180,
    },
    high: {
      url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      width: 480,
      height: 360,
    },
    standard: {
      url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, // Thay sddefault bằng hqdefault
      width: 640,
      height: 480,
    },
    maxres: {
      url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, // Thay maxresdefault bằng hqdefault
      width: 1280,
      height: 720,
    },
  };
}

/**
 * Lấy thông tin video từ oembed API với fallback về embed
 */
export async function crawlVideoByOembed(id: string): Promise<{
  id: string;
  title?: string;
  author?: string;
  image?: string;
  embeddable?: boolean;
  public?: boolean;
} | null> {
  // Kiểm tra cache
  const cacheKey = `oembed:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
  }

  console.log(`[YouTube Crawler] Oembed crawling video: ${id}`);

  try {
    // Thử oembed API trước
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
      // Timeout 2 seconds tương tự Ruby code
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.title) {
        const result = {
          id,
          title: data.title,
          image: data.thumbnail_url,
          author: data.author_name,
        };

        // Lưu vào cache
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        return result;
      }
    } else if (response.status === 401) {
      const result = {
        id,
        embeddable: false,
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } else if (response.status === 403) {
      const result = {
        id,
        public: false,
      };
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
  } catch (error) {
    console.log('Oembed failed, trying embed method');
  }

  // Fallback về phương pháp embed
  try {
    const embedUrl = `https://youtube.com/embed/${id}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Tìm script chứa ytcfg.set
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent || '';
        if (content.includes('ytcfg.set')) {
          try {
            // Trích xuất data từ ytcfg.set pattern
            const match = content.match(/ytcfg\.set\((.*)\);window/);
            if (match && match[1]) {
              const json = JSON.parse(match[1]);
              if (json.PLAYER_VARS?.embedded_player_response) {
                const playerResponse = JSON.parse(
                  json.PLAYER_VARS.embedded_player_response
                );
                const videoDetails =
                  playerResponse?.embedPreview?.thumbnailPreviewRenderer
                    ?.videoDetails?.embeddedPlayerOverlayVideoDetailsRenderer;

                if (videoDetails) {
                  const title =
                    videoDetails?.collapsedRenderer
                      ?.embeddedPlayerOverlayVideoDetailsCollapsedRenderer
                      ?.title?.runs?.[0]?.text;
                  const author =
                    videoDetails?.expandedRenderer
                      ?.embeddedPlayerOverlayVideoDetailsExpandedRenderer?.title
                      ?.runs?.[0]?.text;

                  const result = {
                    id,
                    title: title || undefined,
                    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                    author: author || undefined,
                  };

                  // Lưu vào cache
                  cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now(),
                  });

                  return result;
                }
              }
            }
          } catch (parseError) {
            console.error('Error parsing embed data:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in embed fallback:', error);
  }

  // Trả về thông tin cơ bản nhất
  const result = { id };
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Lấy thông tin chi tiết của một video với cache
 */
export async function crawlVideoById(id: string): Promise<YouTubeVideo | null> {
  // Kiểm tra cache
  const cacheKey = `video:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
  }

  console.log(`[YouTube Crawler] Crawling video: ${id}`);

  const url = `https://www.youtube.com/watch?v=${id}`;
  const document = await fetchHTML(url);

  if (!document) return null;

  const ytData = extractYtInitialData(document);
  if (!ytData) return null;

  try {
    // Lấy thông tin video từ cấu trúc dữ liệu
    const videoData =
      ytData.contents?.twoColumnWatchNextResults?.results?.results
        ?.contents?.[0]?.videoPrimaryInfoRenderer;
    const videoSecondaryInfo =
      ytData.contents?.twoColumnWatchNextResults?.results?.results
        ?.contents?.[1]?.videoSecondaryInfoRenderer;

    if (!videoData) return null;

    // Lấy tiêu đề
    const title = videoData.title?.runs?.[0]?.text || '';

    // Lấy tên kênh
    const channelTitle =
      videoSecondaryInfo?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text ||
      '';
    const channelId =
      videoSecondaryInfo?.owner?.videoOwnerRenderer?.navigationEndpoint
        ?.browseEndpoint?.browseId || '';

    // Lấy lượt xem
    const viewCountText =
      videoData.viewCount?.videoViewCountRenderer?.viewCount?.simpleText ||
      videoData.viewCount?.videoViewCountRenderer?.shortViewCount?.simpleText ||
      '0';
    const viewCount = viewCountText.replace(/[^\d]/g, '');

    // Lấy thời gian đăng tải
    const publishedAtText = videoData.dateText?.simpleText || null;

    // Lấy mô tả
    const description =
      videoSecondaryInfo?.description?.runs
        ?.map((run: any) => run.text)
        .join('') || '';

    // Lấy thời lượng video
    const durationText =
      document
        .querySelector('meta[itemprop="duration"]')
        ?.getAttribute('content') || null;

    // Tạo đối tượng video
    const video: YouTubeVideo = {
      kind: 'youtube#video',
      etag: '',
      id,
      snippet: {
        publishedAt: parsePublishedTime(publishedAtText),
        channelId,
        title,
        description,
        thumbnails: createThumbnails(id),
        channelTitle,
        categoryId: '0',
        liveBroadcastContent: 'none',
        localized: {
          title,
          description,
        },
      },
      contentDetails: {
        duration: durationText || 'PT0S',
        dimension: 'hd',
        definition: 'hd',
        caption: 'false',
        licensedContent: false,
        contentRating: {},
        projection: 'rectangular',
      },
      statistics: {
        viewCount,
        likeCount:
          videoData.videoActions?.menuRenderer?.topLevelButtons?.[0]
            ?.segmentedLikeDislikeButtonRenderer?.likeButton
            ?.toggleButtonRenderer?.defaultText?.simpleText || '0',
        favoriteCount: '0',
        commentCount: '0',
      },
    };

    // Lưu vào cache
    cache.set(cacheKey, {
      data: video,
      timestamp: Date.now(),
    });

    return video;
  } catch (error) {
    console.error(`Error parsing video data for ${id}:`, error);
    return null;
  }
}

/**
 * Tìm kiếm video trên YouTube với cache
 */
export async function crawlSearchVideos(
  query: string,
  maxResults: number = 20
): Promise<ListResponse<YouTubeVideo>> {
  // Kiểm tra cache
  const cacheKey = `search:${query}:${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
  }

  console.log(`[YouTube Crawler] Searching for: ${query}`);

  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encodedQuery}`;

  const document = await fetchHTML(url);

  if (!document) {
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }

  const ytData = extractYtInitialData(document);
  if (!ytData) {
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }

  try {
    const contents =
      ytData.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];
    const items: YouTubeVideo[] = [];

    // Tìm phần tử chứa kết quả tìm kiếm
    for (const section of contents) {
      const itemSectionContents = section.itemSectionRenderer?.contents || [];

      for (const content of itemSectionContents) {
        // Bỏ qua các kết quả không phải video
        if (!content.videoRenderer) continue;

        const videoRenderer = content.videoRenderer;
        const videoId = videoRenderer.videoId;

        if (!videoId) continue;

        // Lấy thông tin cơ bản
        const title = videoRenderer.title?.runs?.[0]?.text || '';
        const channelTitle = videoRenderer.ownerText?.runs?.[0]?.text || '';
        const channelId =
          videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint
            ?.browseId || '';
        const description =
          videoRenderer.detailedMetadataSnippets?.[0]?.snippetText?.runs
            ?.map((run: any) => run.text)
            .join('') || '';
        const publishedAtText =
          videoRenderer.publishedTimeText?.simpleText || null;
        const viewCountText =
          videoRenderer.viewCountText?.simpleText ||
          videoRenderer.viewCountText?.runs?.[0]?.text ||
          '0';
        const viewCount = viewCountText.replace(/[^\d]/g, '');
        const durationText =
          videoRenderer.lengthText?.simpleText ||
          videoRenderer.lengthText?.runs?.[0]?.text ||
          null;

        // Tạo đối tượng video
        const video: YouTubeVideo = {
          kind: 'youtube#video',
          etag: '',
          id: videoId,
          snippet: {
            publishedAt: parsePublishedTime(publishedAtText),
            channelId,
            title,
            description,
            thumbnails: createThumbnails(videoId),
            channelTitle,
            categoryId: '0',
            liveBroadcastContent: 'none',
            localized: {
              title,
              description,
            },
          },
          contentDetails: {
            duration: formatDuration(durationText),
            dimension: 'hd',
            definition: 'hd',
            caption: 'false',
            licensedContent: false,
            contentRating: {},
            projection: 'rectangular',
          },
          statistics: {
            viewCount,
            likeCount: '0',
            favoriteCount: '0',
            commentCount: '0',
          },
        };

        items.push(video);

        // Giới hạn số lượng kết quả
        if (items.length >= maxResults) break;
      }

      if (items.length >= maxResults) break;
    }

    const result = {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: {
        totalResults: items.length,
        resultsPerPage: items.length,
      },
      items,
    };

    // Lưu vào cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error(`Error parsing search results for ${query}:`, error);
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }
}

/**
 * Trích xuất từ khóa quan trọng từ tiêu đề và mô tả
 */
function extractKeywords(title: string, description: string): string[] {
  // Loại bỏ các ký tự đặc biệt và chuyển thành chữ thường
  const cleanText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Loại bỏ các từ phổ biến không quan trọng
  const stopWords = new Set([
    'review',
    'phim',
    'movie',
    'film',
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'từ',
    'và',
    'hoặc',
    'trong',
    'ngoài',
    'trên',
    'dưới',
    'về',
    'của',
    'trailer',
    'official',
    'video',
    'full',
    'hd',
    '4k',
    'phần',
    'tập',
    'season',
    'episode',
  ]);

  // Tách từ và lọc bỏ stopwords
  const words = [
    ...new Set([
      ...cleanText(title).split(' '),
      ...cleanText(description).split(' ').slice(0, 50), // Chỉ lấy 50 từ đầu tiên từ mô tả
    ]),
  ].filter((word) => word.length > 2 && !stopWords.has(word));

  return words;
}

/**
 * Tạo query tìm kiếm từ danh sách từ khóa
 */
function generateSearchQuery(keywords: string[]): string {
  // Lọc từ khóa có ý nghĩa (độ dài > 3)
  const validKeywords = keywords.filter((keyword) => keyword.length > 3);

  if (validKeywords.length === 0) {
    return 'review phim mới';
  }

  // Chọn ngẫu nhiên một từ khóa
  const randomKeyword =
    validKeywords[Math.floor(Math.random() * validKeywords.length)];
  return `review phim ${randomKeyword}`;
}

/**
 * Lấy danh sách video phổ biến
 */
export async function crawlMostPopular(
  maxResults: number = 20
): Promise<ListResponse<YouTubeVideo>> {
  console.log('[YouTube Crawler] Getting most popular videos');

  const url = 'https://www.youtube.com/feed/trending';
  const document = await fetchHTML(url);

  if (!document) {
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }

  const ytData = extractYtInitialData(document);
  if (!ytData) {
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }

  try {
    const tabs = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const trendingTab =
      tabs.find((tab: any) => tab.tabRenderer?.title === 'Thịnh hành') ||
      tabs[0];

    if (!trendingTab) {
      return {
        kind: 'youtube#videoListResponse',
        etag: '',
        pageInfo: { totalResults: 0, resultsPerPage: 0 },
        items: [],
      };
    }

    const contents =
      trendingTab.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const videos: YouTubeVideo[] = [];

    for (const section of contents) {
      const itemSectionContents = section.itemSectionRenderer?.contents || [];

      for (const content of itemSectionContents) {
        const videoRenderer =
          content.videoRenderer ||
          content.shelfRenderer?.content?.verticalListRenderer?.items?.[0]
            ?.videoRenderer;

        if (!videoRenderer) continue;

        const videoId = videoRenderer.videoId;

        if (!videoId) continue;

        const title = videoRenderer.title?.runs?.[0]?.text || '';
        const channelTitle = videoRenderer.ownerText?.runs?.[0]?.text || '';
        const channelId =
          videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint
            ?.browseId || '';
        const description =
          videoRenderer.detailedMetadataSnippets?.[0]?.snippetText?.runs
            ?.map((run: any) => run.text)
            .join('') || '';
        const publishedAtText =
          videoRenderer.publishedTimeText?.simpleText || null;

        // Lấy lượt xem
        const viewCountText =
          videoRenderer.viewCountText?.simpleText ||
          videoRenderer.shortViewCountText?.simpleText ||
          '0 lượt xem';
        const viewCount = viewCountText.replace(/[^\d]/g, '');

        // Lấy thời lượng
        const durationText = videoRenderer.lengthText?.simpleText || null;

        const video: YouTubeVideo = {
          kind: 'youtube#video',
          etag: '',
          id: videoId,
          snippet: {
            publishedAt: parsePublishedTime(publishedAtText),
            channelId,
            title,
            description,
            thumbnails: createThumbnails(videoId),
            channelTitle,
            categoryId: '0',
            liveBroadcastContent: 'none',
            localized: {
              title,
              description,
            },
          },
          contentDetails: {
            duration: formatDuration(durationText),
            dimension: 'hd',
            definition: 'hd',
            caption: 'false',
            licensedContent: false,
            contentRating: {},
            projection: 'rectangular',
          },
          statistics: {
            viewCount,
            favoriteCount: '0',
          },
        };

        videos.push(video);

        if (videos.length >= maxResults) break;
      }

      if (videos.length >= maxResults) break;
    }

    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: {
        totalResults: videos.length,
        resultsPerPage: videos.length,
      },
      items: videos,
    };
  } catch (error) {
    console.error('Error parsing trending videos:', error);
    return {
      kind: 'youtube#videoListResponse',
      etag: '',
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }
}
