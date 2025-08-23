import { VideoCard } from './VideoCard';
import type { VideoCardData } from '@/types/youtube';

interface VideoGridProps {
  videos: VideoCardData[];
  showChannel?: boolean;
  className?: string;
}

export function VideoGrid({
  videos,
  showChannel = true,
  className = '',
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📺</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Không tìm thấy video nào
        </h3>
        <p className="text-muted-foreground">
          Thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} showChannel={showChannel} />
      ))}
    </div>
  );
}
