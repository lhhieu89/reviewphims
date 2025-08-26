import { env } from '@/lib/env';

export async function GET() {
  const now = new Date().toISOString();
  const baseUrl = env.SITE_URL;

  // Popular video categories and queries for RSS feed
  const feedItems = [
    {
      title: 'Review Phim Cung Đấu Hay Nhất 2025',
      description:
        'Khám phá những bộ phim cung đấu được review nhiều nhất trên YouTube',
      link: `${baseUrl}/search?q=review+phim+cung+đấu`,
      pubDate: now,
      guid: `${baseUrl}/search?q=review+phim+cung+đấu`,
    },
    {
      title: 'Review Phim Hàn Quốc Mới Nhất',
      description:
        'Tổng hợp những video review phim Hàn Quốc hot nhất hiện tại',
      link: `${baseUrl}/search?q=review+phim+hàn+quốc`,
      pubDate: now,
      guid: `${baseUrl}/search?q=review+phim+hàn+quốc`,
    },
    {
      title: 'Tóm Tắt Phim Hay - Video Review Chất Lượng',
      description:
        'Những video tóm tắt phim hay nhất từ các YouTuber nổi tiếng',
      link: `${baseUrl}/search?q=tóm+tắt+phim+hay`,
      pubDate: now,
      guid: `${baseUrl}/search?q=tóm+tắt+phim+hay`,
    },
    {
      title: 'Review Phim Việt Nam 2025',
      description: 'Khám phá những bộ phim Việt Nam được đánh giá cao nhất',
      link: `${baseUrl}/search?q=review+phim+việt+nam`,
      pubDate: now,
      guid: `${baseUrl}/search?q=review+phim+việt+nam`,
    },
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Review Phim - Video Review Phim Hay Nhất</title>
    <link>${baseUrl}</link>
    <description>Khám phá những video review phim mới nhất và hay nhất từ YouTube. Review phim Việt, phim quốc tế, tất cả thể loại.</description>
    <language>vi-VN</language>
    <copyright>Copyright ${new Date().getFullYear()} Review Phim</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon-512.png</url>
      <title>Review Phim</title>
      <link>${baseUrl}</link>
      <width>512</width>
      <height>512</height>
    </image>
    <category>Entertainment</category>
    <category>Movies</category>
    <category>Reviews</category>
    <managingEditor>info@reviewphim.com (Review Phim)</managingEditor>
    <webMaster>webmaster@reviewphim.com (Review Phim Webmaster)</webMaster>

${feedItems
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <category>Review Phim</category>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
