import Link from 'next/link';
import { SearchBarWrapper } from './SearchBarWrapper';
import { FilmIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors"
          >
            <FilmIcon className="h-6 w-6" />
            Review Phim
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <SearchBarWrapper />
        </div>

        <div className="md:hidden">
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Trang chủ
            </Link>
            <Link
              href="/search"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Tìm kiếm
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
