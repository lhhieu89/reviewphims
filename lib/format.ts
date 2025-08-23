/**
 * Format view count to abbreviated form (e.g., 1.2M, 5.3K)
 */
export function formatViewCount(count: string | number): string {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;

  if (isNaN(num)) return '0';

  const formatter = new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  return formatter.format(num);
}

/**
 * Format relative time in Vietnamese (e.g., "3 ngày trước", "2 tuần trước")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} năm trước`;
  } else if (months > 0) {
    return `${months} tháng trước`;
  } else if (weeks > 0) {
    return `${weeks} tuần trước`;
  } else if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else if (minutes > 0) {
    return `${minutes} phút trước`;
  } else {
    return 'Vừa xong';
  }
}

/**
 * Format duration from ISO 8601 format (PT4M13S) to readable format (4:13)
 */
export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(num: string | number): string {
  const number = typeof num === 'string' ? parseInt(num, 10) : num;

  if (isNaN(number)) return '0';

  return new Intl.NumberFormat('vi-VN').format(number);
}

/**
 * Format date with Vietnamese locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get best thumbnail URL from YouTube thumbnails object
 */
export function getBestThumbnail(thumbnails: any): string {
  if (thumbnails.maxres) return thumbnails.maxres.url;
  if (thumbnails.high) return thumbnails.high.url;
  if (thumbnails.medium) return thumbnails.medium.url;
  if (thumbnails.default) return thumbnails.default.url;
  return '';
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
