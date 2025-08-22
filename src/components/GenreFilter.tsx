import Link from 'next/link';
import { MOVIE_CATEGORIES } from '@/lib/review-keywords';

interface GenreFilterProps {
  currentGenre?: string;
  className?: string;
}

const GENRE_LINKS = [
  { key: 'all', label: 'Tất cả', query: 'review phim 2025' },
  { key: 'action', label: '🎬 Hành động', query: 'review phim hành động' },
  { key: 'horror', label: '👻 Kinh dị', query: 'review phim kinh dị' },
  { key: 'romance', label: '💕 Tình cảm', query: 'review phim tình cảm' },
  { key: 'thriller', label: '🕵️ Tâm lý', query: 'review phim tâm lý' },
  { key: 'comedy', label: '😂 Hài', query: 'review phim hài' },
  { key: 'animation', label: '🎨 Hoạt hình', query: 'review phim hoạt hình' },
];

export function GenreFilter({
  currentGenre = 'all',
  className = '',
}: GenreFilterProps) {
  return (
    <div className={`border-b border-border pb-4 ${className}`}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Thể loại phim
      </h3>
      <div className="flex flex-wrap gap-2">
        {GENRE_LINKS.map((genre) => {
          const isActive = currentGenre === genre.key;

          return (
            <Link
              key={genre.key}
              href={`/search?q=${encodeURIComponent(genre.query)}`}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              {genre.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
