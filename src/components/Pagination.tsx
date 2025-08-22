'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { createUrl } from '@/lib/utils';

interface PaginationProps {
  nextPageToken?: string;
  prevPageToken?: string;
  currentPath: string;
  className?: string;
}

export function Pagination({
  nextPageToken,
  prevPageToken,
  currentPath,
  className = '',
}: PaginationProps) {
  const searchParams = useSearchParams();

  if (!nextPageToken && !prevPageToken) {
    return null;
  }

  const createPaginationUrl = (pageToken?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (pageToken) {
      params.set('pageToken', pageToken);
    } else {
      params.delete('pageToken');
    }

    return createUrl(currentPath, params);
  };

  return (
    <div className={`flex justify-center items-center gap-4 ${className}`}>
      {prevPageToken ? (
        <Link
          href={createPaginationUrl(prevPageToken) as any}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Trang trước
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed">
          <ChevronLeftIcon className="h-4 w-4" />
          Trang trước
        </div>
      )}

      {nextPageToken ? (
        <Link
          href={createPaginationUrl(nextPageToken) as any}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Trang sau
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed">
          Trang sau
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
