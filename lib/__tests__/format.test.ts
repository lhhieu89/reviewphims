import { describe, it, expect } from 'vitest';
import {
  formatViewCount,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  getBestThumbnail,
  truncateText,
} from '../format';

describe('formatViewCount', () => {
  it('should format numbers correctly', () => {
    expect(formatViewCount(1000)).toContain('1');
    expect(formatViewCount(1000)).toContain('N');
    expect(formatViewCount(1000000)).toContain('1');
    expect(formatViewCount(1000000)).toContain('Tr');
    expect(formatViewCount(999)).toBe('999');
  });

  it('should handle invalid input', () => {
    expect(formatViewCount('invalid')).toBe('0');
    expect(formatViewCount('')).toBe('0');
  });
});

describe('formatRelativeTime', () => {
  it('should format relative time correctly', () => {
    const now = new Date();

    // 1 hour ago
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1 giờ trước');

    // 2 days ago
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2 ngày trước');

    // 30 seconds ago
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo.toISOString())).toBe('Vừa xong');
  });
});

describe('formatDuration', () => {
  it('should format ISO 8601 duration correctly', () => {
    expect(formatDuration('PT4M13S')).toBe('4:13');
    expect(formatDuration('PT1H30M45S')).toBe('1:30:45');
    expect(formatDuration('PT45S')).toBe('0:45');
    expect(formatDuration('PT2M')).toBe('2:00');
    expect(formatDuration('PT1H')).toBe('1:00:00');
  });

  it('should handle invalid duration', () => {
    expect(formatDuration('invalid')).toBe('0:00');
    expect(formatDuration('')).toBe('0:00');
  });
});

describe('formatNumber', () => {
  it('should format numbers with Vietnamese locale', () => {
    expect(formatNumber(1000)).toBe('1.000');
    expect(formatNumber(1000000)).toBe('1.000.000');
    expect(formatNumber('5000')).toBe('5.000');
  });

  it('should handle invalid input', () => {
    expect(formatNumber('invalid')).toBe('0');
  });
});

describe('getBestThumbnail', () => {
  it('should return the best available thumbnail', () => {
    const thumbnails = {
      default: { url: 'default.jpg', width: 120, height: 90 },
      medium: { url: 'medium.jpg', width: 320, height: 180 },
      high: { url: 'high.jpg', width: 480, height: 360 },
      maxres: { url: 'maxres.jpg', width: 1280, height: 720 },
    };

    expect(getBestThumbnail(thumbnails)).toBe('maxres.jpg');

    const thumbnailsWithoutMaxres = {
      default: { url: 'default.jpg', width: 120, height: 90 },
      high: { url: 'high.jpg', width: 480, height: 360 },
    };

    expect(getBestThumbnail(thumbnailsWithoutMaxres)).toBe('high.jpg');
  });

  it('should return empty string for empty thumbnails', () => {
    expect(getBestThumbnail({})).toBe('');
  });
});

describe('truncateText', () => {
  it('should truncate text correctly', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very long...');

    const shortText = 'Short text';
    expect(truncateText(shortText, 20)).toBe('Short text');
  });
});
