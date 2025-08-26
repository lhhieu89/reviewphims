import { env } from '@/lib/env';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.other';
  videoUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

export function SEOHead({
  title = 'Review Phim - Xem Review Phim Mới Nhất 2025',
  description = 'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim được đánh giá cao.',
  image = `${env.SITE_URL}/og-default.jpg`,
  url = env.SITE_URL,
  type = 'website',
  videoUrl,
  author,
  publishedTime,
  modifiedTime,
  keywords = ['review phim', 'tóm tắt phim', 'phim hay', 'youtube review phim'],
}: SEOHeadProps) {
  const fullTitle = title.includes('Review Phim')
    ? title
    : `${title} | Review Phim`;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {author && <meta name="author" content={author} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Review Phim" />
      <meta property="og:locale" content="vi_VN" />

      {videoUrl && (
        <>
          <meta property="og:video" content={videoUrl} />
          <meta property="og:video:type" content="text/html" />
          <meta property="og:video:width" content="1280" />
          <meta property="og:video:height" content="720" />
        </>
      )}

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {videoUrl && (
        <>
          <meta name="twitter:player" content={videoUrl} />
          <meta name="twitter:player:width" content="1280" />
          <meta name="twitter:player:height" content="720" />
        </>
      )}

      {/* Additional SEO Meta Tags */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="googlebot"
        content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
      />
      <meta
        name="bingbot"
        content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
      />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Language alternates */}
      <link rel="alternate" href={url} hrefLang="vi" />
      <link rel="alternate" href={url} hrefLang="x-default" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://i.ytimg.com" />
      <link rel="preconnect" href="https://yt3.ggpht.com" />
      <link rel="dns-prefetch" href="https://youtube.com" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />
    </>
  );
}
