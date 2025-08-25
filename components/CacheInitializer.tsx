'use client';

import { useEffect } from 'react';

export function CacheInitializer() {
  useEffect(() => {
    // Initialize cache on app startup
    const initializeCache = async () => {
      try {
        await fetch('/api/cache/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'initialize_cache' }),
        });
        console.log('Video cache initialization requested');
      } catch (error) {
        console.error('Failed to initialize cache:', error);
      }
    };

    // Initialize cache after a short delay
    const timer = setTimeout(initializeCache, 2000);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}