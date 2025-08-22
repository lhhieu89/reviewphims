You are a senior Next.js architect. Build a production-ready web app. Follow every requirement exactly.

Tech & Project Setup

Framework: Next.js 14+ (App Router), TypeScript, ESLint + Prettier, Tailwind CSS.

Directory: app/ router with RSC; use src/ root.

Package manager: pnpm.

Deploy-ready (Vercel friendly).

Create .env.example and read env via process.env.

All API calls to YouTube Data API v3 must run server-side only through Next Route Handlers under /api/youtube/\*. Never expose raw API key to the client.

ENV & Config

.env.example contains:

YOUTUBE_API_KEY=YOUR_KEY_HERE
YOUTUBE_REGION_CODE=VN
SITE_URL=https://example.com

Validate env on boot using a small utility src/lib/env.ts. Throw clear error if missing.

Pages & Routes (App Router)

/ (Home)

Server Component (RSC) with ISR (revalidate 10 minutes).

Call /api/youtube/most-popular?region=VN to load most popular videos via videos.list?chart=mostPopular.

Grid responsive of video cards; each card: thumbnail, title (2 lines clamp), channel title, published time (relative), views abbreviated.

Sections: "Trending now in Vietnam" and optionally "Tech & Movies" using videoCategoryId filters (optional, do simple single section if time).

/search

URL query param q required. Also support pageToken for pagination.

Server Component for first render (SEO) + client enhancement.

Fetch via /api/youtube/search?q=...&type=video&maxResults=20&pageToken=....

Show total results approx if returned, list of videos as cards.

Pagination using nextPageToken and prevPageToken in query string.

Show empty-state when no results; keep the search box sticky on top.

/video/[id]

Server Component, dynamic=force-dynamic or revalidate: 300.

Fetch via:

/api/youtube/video?id=VIDEO_ID → videos.list?part=snippet,contentDetails,statistics.

/api/youtube/channel?id=CHANNEL_ID for channel snippet (avatar, subs approximate).

/api/youtube/related?id=VIDEO_ID → search.list?relatedToVideoId=...&type=video.

Render:

YouTube embed using privacy mode https://www.youtube-nocookie.com/embed/${id} with responsive 16:9 container.

Title, channel (link to channel on YouTube), published time, view count, like count (if available in statistics), description (expand/collapse).

"Related videos" grid/list.

Add Structured Data (VideoObject) via <script type="application/ld+json"> using snippet & statistics.

Global UI/UX

Layout: app/layout.tsx with header and footer.

Header:

Logo (text or simple SVG).

SearchBar component with debounced input; submits to /search?q=....

Nav links: Home, Search.

Footer: copyright & links (About, Privacy).

Loading & Error states:

loading.tsx and error.tsx for /, /search, /video/[id].

Skeletons for video cards.

Accessibility: semantic HTML, alt text for images, labels for inputs.

i18n-ready (basic): date formatting for vi-VN, numerals using Intl.NumberFormat('vi-VN').

Components (in src/components)

VideoCard.tsx: props from YouTube snippet/statistics; clickable to /video/[id].

VideoGrid.tsx: responsive grid (2/3/4 columns).

SearchBar.tsx: controlled input in header; on Enter or submit navigate to /search?q=....

Pagination.tsx: builds prev/next links using current query params.

Meta.tsx: helper to set <title>, <meta>, OpenGraph/Twitter tags.

Server Utilities (in src/lib)

env.ts: env schema guard.

youtube.ts:

Server-side fetch wrapper to YouTube Data API v3 base https://www.googleapis.com/youtube/v3.

Expose typed functions:

listMostPopular({ regionCode, maxResults, pageToken })

searchVideos({ q, maxResults, pageToken })

getVideoById({ id })

getChannelById({ id })

listRelatedVideos({ id, maxResults })

Handle quota errors (HTTP 403/400) and return normalized error objects.

format.ts: helpers for view counts (1.2M), relative time (e.g., "3 ngày trước").

Route Handlers (in src/app/api/youtube/\*/route.ts)

Implement the following endpoints; all GET only, cache with revalidate: 300 and set cache: 'force-cache' where appropriate:

/api/youtube/most-popular → videos.list?chart=mostPopular&part=snippet,statistics&regionCode=...&maxResults=20

/api/youtube/search → search.list?part=snippet&type=video&maxResults=20&q=...&pageToken=...

/api/youtube/video → videos.list?part=snippet,contentDetails,statistics&id=...

/api/youtube/channel → channels.list?part=snippet,statistics&id=...

/api/youtube/related → search.list?part=snippet&type=video&relatedToVideoId=...&maxResults=12

Security

Read YOUTUBE_API_KEY server-side; never send to client.

Add a tiny rate limiter (per-IP, memory token bucket) in API routes to guard abuse. If exceeded, return 429 with JSON.

SEO

Use generateMetadata in each page for dynamic titles/descriptions.

OpenGraph/Twitter meta tags.

robots.txt & sitemap.xml via simple route handlers in app/.

Canonical URL from SITE_URL.

Styling

Tailwind base theme. Video cards with hover, line-clamp, skeletons.

Mobile-first; sticky header with search.

Respect prefers-color-scheme (light/dark).

Testing & Quality

Add minimal vitest for format.ts.

ESLint config for Next/TypeScript; Prettier.

Error Handling

Gracefully render when a video is private/unavailable.

If YouTube quota error: show friendly message and link out to YouTube search page as fallback.

Data Types

Create TypeScript types for the subset of YouTube responses used:

YouTubeVideo, YouTubeSearchItem, YouTubeChannel, PageInfo, ListResponse<T>.

Example UX Flows

Home → click a card → /video/[id].

Enter search in header → /search?q=keyword (server render) → paginate via next/prev tokens.

In video page, related list cards navigate to other videos without full page flicker.

Deliverables

A complete Next.js repo with:

src/app/(home)/page.tsx

src/app/search/page.tsx

src/app/video/[id]/page.tsx

src/app/api/youtube/\*/route.ts (5 endpoints)

src/components/\*

src/lib/env.ts, src/lib/youtube.ts, src/lib/format.ts

tailwind setup, eslint, prettier, vitest config

.env.example, README.md with run instructions (pnpm i && pnpm dev)

README must document:

How to get a YouTube API key, set .env.

Quota considerations and how to reduce parts/fields.

Deployment notes (Vercel env vars).

Implementation Notes

Use edge-safe fetch where possible; otherwise default runtime.

Use Image component for thumbnails with fill and sizes.

Thumbnails: pick maxres, else fallback high/medium.

Avoid client fetching of YouTube directly. All via server routes.

Build it now.
