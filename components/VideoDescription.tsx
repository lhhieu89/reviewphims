'use client';

import { useState } from 'react';

interface VideoDescriptionProps {
  description: string;
}

export function VideoDescription({ description }: VideoDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 300;
  const displayText =
    shouldTruncate && !isExpanded
      ? description.slice(0, 300) + '...'
      : description;

  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground whitespace-pre-wrap">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
