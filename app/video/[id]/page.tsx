import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { VideoSuggestions } from '@/components/VideoSuggestions';
import { WatchedVideoTracker } from '@/components/WatchedVideoTracker';
import { env } from '@/lib/env';

export const revalidate = 1800; // 30 minutes for better caching

interface VideoPageProps {
  params: {
    id: string;
  };
}

interface VideoOembedData {
  id: string;
  title?: string;
  author?: string;
  image?: string;
  embeddable?: boolean;
  public?: boolean;
}

async function getVideoOembedData(id: string): Promise<VideoOembedData | null> {
  try {
    // First try YouTube oembed API directly
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const response = await fetch(oembedUrl, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id,
        title: data.title,
        author: data.author_name,
        image: data.thumbnail_url,
      };
    }

    // If oembed fails, try embed page fallback
    return await getVideoFromEmbed(id);
  } catch (error) {
    console.error('Error fetching video oembed data:', error);
    return await getVideoFromEmbed(id);
  }
}

async function getVideoFromEmbed(id: string): Promise<VideoOembedData | null> {
  try {
    const embedUrl = `https://youtube.com/embed/${id}`;
    const response = await fetch(embedUrl, {
      next: { revalidate: 1800 },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.ok) {
      return {
        id,
        title: `YouTube Video ${id}`,
        author: 'YouTube',
        image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching video from embed:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  try {
    const videoData = await getVideoOembedData(params.id);

    if (!videoData || !videoData.title) {
      return {
        title: 'Video không tìm thấy',
        description: 'Video này không tồn tại hoặc đã bị xóa.',
      };
    }

    return {
      title: videoData.title,
      description: `Video từ ${videoData.author || 'YouTube'}: ${videoData.title}`,
      alternates: {
        canonical: `/video/${params.id}`,
      },
      openGraph: {
        title: videoData.title,
        description: `Video từ ${videoData.author || 'YouTube'}: ${videoData.title}`,
        type: 'video.other',
        url: `${env.SITE_URL}/video/${params.id}`,
        images: videoData.image ? [{ url: videoData.image }] : [],
        videos: [
          {
            url: `https://www.youtube.com/watch?v=${params.id}`,
            type: 'text/html',
          },
        ],
      },
      twitter: {
        card: 'player',
        title: videoData.title,
        description: `Video từ ${videoData.author || 'YouTube'}: ${videoData.title}`,
        images: videoData.image ? [videoData.image] : [],
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
    const videoData = await getVideoOembedData(params.id);

    if (!videoData) {
      notFound();
    }

    // Handle embeddable/public restrictions
    if (videoData.embeddable === false) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Video không thể nhúng
            </h1>
            <p className="text-muted-foreground mb-6">
              Video này không thể phát trên trang web bên ngoài. Vui lòng xem
              trên YouTube.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Xem trên YouTube
            </a>
          </div>
        </div>
      );
    }

    if (videoData.public === false) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Video riêng tư
            </h1>
            <p className="text-muted-foreground mb-6">
              Video này đã được đặt ở chế độ riêng tư hoặc đã bị xóa.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Thử xem trên YouTube
            </a>
          </div>
        </div>
      );
    }

    // Structured data for SEO (simplified)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: videoData.title || 'YouTube Video',
      thumbnailUrl:
        videoData.image || `https://i.ytimg.com/vi/${params.id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${params.id}`,
      author: videoData.author
        ? {
            '@type': 'Person',
            name: videoData.author,
          }
        : undefined,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Watched video tracker */}
        <WatchedVideoTracker videoId={params.id} />

        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Video player */}
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <YouTubePlayer
                videoId={params.id}
                title={videoData.title || 'YouTube Video'}
                className="rounded-lg"
              />
            </div>

            {/* Video info */}
            <div className="space-y-4">
              {videoData.title && (
                <h1 className="text-2xl font-bold text-foreground">
                  {videoData.title}
                </h1>
              )}

              {videoData.author && (
                <div className="flex items-center gap-4 hidden">
                  <div>
                    <p className="font-semibold text-foreground">
                      {videoData.author}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video suggestions - full width like homepage */}
          <VideoSuggestions currentVideoId={params.id} />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in VideoPage:', error);
    notFound();
  }
}
