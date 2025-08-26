import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang không tìm thấy - 404',
  description:
    'Trang bạn đang tìm kiếm không tồn tại. Khám phá các video review phim hay khác tại Review Phim.',
  robots: 'noindex, nofollow',
  alternates: {
    canonical: 'https://reviewphim.com/404',
  },
};

export default function NotFound() {
  const popularSearches = [
    'review phim cung đấu',
    'review phim hàn quốc',
    'tóm tắt phim hay',
    'review phim 2025',
    'review phim việt nam',
    'review phim trung quốc',
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 404 Hero Section */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Trang không tìm thấy
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy khám
          phá những video review phim hay khác bên dưới.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            🏠 Về trang chủ
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-semibold"
          >
            🔍 Tìm kiếm video
          </Link>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Tìm kiếm phổ biến
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSearches.map((search) => (
            <Link
              key={search}
              href={`/search?q=${encodeURIComponent(search)}`}
              className="group p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎬</span>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {search}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Xem video review về {search}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO Help */}
      <div className="max-w-2xl mx-auto mt-16 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-3">💡 Gợi ý tìm kiếm:</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Kiểm tra lại URL có chính xác không</li>
          <li>• Thử tìm kiếm bằng từ khóa tương tự</li>
          <li>• Khám phá các video review phim hot nhất tại trang chủ</li>
          <li>• Sử dụng thanh tìm kiếm để tìm video review mong muốn</li>
        </ul>
      </div>
    </div>
  );
}
