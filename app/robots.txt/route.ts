import { env } from '@/lib/env';

export function GET() {
  const robotsTxt = `# robots.txt for Review Phim
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /.well-known/

# Special crawlers
User-agent: Googlebot
Allow: /
Disallow: /api/

User-agent: Bingbot
Allow: /
Disallow: /api/

# Crawl-delay for heavy crawlers
User-agent: bingbot
Crawl-delay: 5

User-agent: slurp
Crawl-delay: 5

# Sitemaps
Sitemap: ${env.SITE_URL}/sitemap.xml`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
