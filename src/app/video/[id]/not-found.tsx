import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Video không tìm thấy
      </h2>
      <p className="text-muted-foreground mb-6">
        Video này không tồn tại hoặc đã bị xóa.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Về trang chủ
        </Link>
        <Link
          href="/search"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Tìm kiếm video khác
        </Link>
      </div>
    </div>
  );
}
