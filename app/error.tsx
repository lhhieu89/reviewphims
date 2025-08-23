'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">💥</div>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Có lỗi xảy ra!
      </h2>
      <p className="text-muted-foreground mb-6">
        Không thể tải trang này. Vui lòng thử lại.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Thử lại
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
