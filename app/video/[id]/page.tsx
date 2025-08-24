import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { VideoDescription } from '@/components/VideoDescription';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import RelatedVideos, { RelatedVideosSkeleton } from '@/components/RelatedVideos';
import { env } from '@/lib/env';
import {
  formatViewCount,
  formatRelativeTime,
  formatNumber,
  getBestThumbnail,
} from '@/lib/format';
import type {
  YouTubeVideo,
  YouTubeChannel,
  ListResponse,
  YouTubeSearchItem,
  VideoCardData,
} from '@/types/youtube';

export const revalidate = 300; // 5 minutes

interface VideoPageProps {
  params: {
    id: string;
  };
}

async function getVideoData(id: string): Promise<{
  video: YouTubeVideo;
  channel: YouTubeChannel | null;
}> {
  try {
    // Fetch video details
    const videoResponse = await fetch(
      `${env.SITE_URL}/api/youtube/video?id=${id}`,
      { next: { revalidate: 300 } }
    );

    if (!videoResponse.ok) {
      throw new Error('Video not found');
    }

    const video: YouTubeVideo = await videoResponse.json();

    // Fetch channel details - TEMPORARILY DISABLED TO REDUCE API REQUESTS
    const channel: YouTubeChannel | null = null;
    // try {
    //   const channelResponse = await fetch(
    //     `${env.SITE_URL}/api/youtube/channel?id=${video.snippet.channelId}`,
    //     { next: { revalidate: 300 } }
    //   );
    //   if (channelResponse.ok) {
    //     channel = await channelResponse.json();
    //   }
    // } catch (error) {
    //   console.error('Error fetching channel:', error);
    // }

    return { video, channel };
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  try {
    const { video } = await getVideoData(params.id);

    const thumbnailUrl = getBestThumbnail(video.snippet.thumbnails);

    return {
      title: video.snippet.title,
      description: video.snippet.description.slice(0, 160) + '...',
      alternates: {
        canonical: `/video/${params.id}`,
      },
      openGraph: {
        title: video.snippet.title,
        description: video.snippet.description.slice(0, 160) + '...',
        type: 'video.other',
        url: `${env.SITE_URL}/video/${params.id}`,
        images: thumbnailUrl ? [{ url: thumbnailUrl }] : [],
        videos: [
          {
            url: `https://www.youtube.com/watch?v=${params.id}`,
            type: 'text/html',
          },
        ],
      },
      twitter: {
        card: 'player',
        title: video.snippet.title,
        description: video.snippet.description.slice(0, 160) + '...',
        images: thumbnailUrl ? [thumbnailUrl] : [],
        players: [
          {
            playerUrl: `https://www.youtube-nocookie.com/embed/${params.id}`,
            streamUrl: `https://www.youtube.com/watch?v=${params.id}`,
            width: 1280,
            height: 720,
          },
        ],
      },
    };
  } catch {
    return {
      title: 'Video không tìm thấy',
      description: 'Video này không tồn tại hoặc đã bị xóa.',
    };
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  try {
    const { video, channel } = await getVideoData(params.id);

    const channelThumbnail = channel
      ? getBestThumbnail(channel.snippet.thumbnails)
      : null;

    // Structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: getBestThumbnail(video.snippet.thumbnails),
      uploadDate: video.snippet.publishedAt,
      duration: video.contentDetails?.duration,
      embedUrl: `https://www.youtube-nocookie.com/embed/${params.id}`,
      interactionStatistic: video.statistics
        ? [
            {
              '@type': 'InteractionCounter',
              interactionType: { '@type': 'WatchAction' },
              userInteractionCount: parseInt(video.statistics.viewCount || '0'),
            },
            ...(video.statistics.likeCount
              ? [
                  {
                    '@type': 'InteractionCounter',
                    interactionType: { '@type': 'LikeAction' },
                    userInteractionCount: parseInt(video.statistics.likeCount),
                  },
                ]
              : []),
          ]
        : [],
      author: {
        '@type': 'Person',
        name: video.snippet.channelTitle,
        url: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main video content */}
            <div className="lg:col-span-2">
              {/* Video player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <YouTubePlayer
                  videoId={params.id}
                  title={video.snippet.title}
                  className="rounded-lg"
                />
              </div>

              {/* Video info */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground">
                  {video.snippet.title}
                </h1>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* TEMPORARILY HIDDEN TO REDUCE API REQUESTS */}
                    {/* {channelThumbnail && (
                      <Image
                        src={channelThumbnail}
                        alt={video.snippet.channelTitle}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )} */}
                    <div>
                      <Link
                        href={`https://www.youtube.com/channel/${video.snippet.channelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {video.snippet.channelTitle}
                      </Link>
                      {/* TEMPORARILY HIDDEN TO REDUCE API REQUESTS */}
                      {/* {channel?.statistics?.subscriberCount && (
                        <p className="text-sm text-muted-foreground">
                          {formatViewCount(channel.statistics.subscriberCount)}{' '}
                          người đăng ký
                        </p>
                      )} */}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {video.statistics?.viewCount && (
                      <span>
                        {formatViewCount(video.statistics.viewCount)} lượt xem
                      </span>
                    )}
                    {video.statistics?.likeCount && (
                      <span className="hidden">
                        {formatViewCount(video.statistics.likeCount)} lượt thích
                      </span>
                    )}
                    <span className="hidden">{formatRelativeTime(video.snippet.publishedAt)}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-card p-4 rounded-lg">
                  <VideoDescription description={video.snippet.description} />
                </div>
              </div>
            </div>

            {/* Related videos sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Video liên quan
              </h2>

              <Suspense fallback={<RelatedVideosSkeleton />}>
                <RelatedVideos videoId={params.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in VideoPage:', error);
    notFound();
  }
}
