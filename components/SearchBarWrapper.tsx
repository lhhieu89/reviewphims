import { Suspense } from 'react';
import { SearchBar } from './SearchBar';

interface SearchBarWrapperProps {
  className?: string;
  placeholder?: string;
}

function SearchBarFallback() {
  return (
    <div className="relative">
      <div className="relative">
        <div className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background animate-pulse h-10" />
      </div>
    </div>
  );
}

export function SearchBarWrapper(props: SearchBarWrapperProps) {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBar {...props} />
    </Suspense>
  );
}
