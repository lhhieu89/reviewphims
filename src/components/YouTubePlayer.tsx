'use client';

import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubePlayerAPIReady: () => void;
  }
}

export function YouTubePlayer({
  videoId,
  title,
  className,
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Function to initialize the player
    const initializePlayer = () => {
      if (!isMounted || !playerRef.current) return;

      // Destroy existing player if it exists
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0, // Don't show related videos from other channels
          autoplay: 1, // Auto-play the video
          loop: 0, // Don't loop (set to 1 if you want looping)
          controls: 1, // Show player controls
          showinfo: 0, // Hide video title and uploader info
          autohide: 1, // Auto-hide controls after user stops interacting
          modestbranding: 1, // Hide YouTube logo
          fs: 1, // Allow fullscreen
          cc_load_policy: 0, // Hide closed captions by default
          iv_load_policy: 3, // Hide video annotations
          start: 0, // Start time in seconds
          disablekb: 0, // Enable keyboard controls
          playsinline: 1, // Play inline on mobile
        },
        events: {
          onReady: (event: any) => {
            // Auto-play when ready
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // Handle state changes if needed
            if (event.data === window.YT.PlayerState.ENDED) {
              // Video ended - you could implement next video logic here
              console.log('Video ended');
            }
          },
          onError: (event: any) => {
            console.error('YouTube Player Error:', event.data);
          },
        },
      });
    };

    // Load YouTube API if not already loaded
    if (
      typeof window.YT === 'undefined' ||
      typeof window.YT.Player === 'undefined'
    ) {
      // Create script tag to load YouTube API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/player_api';
      // Set up callback for when API is ready
      window.onYouTubePlayerAPIReady = () => {
        if (isMounted) {
          initializePlayer();
        }
      };

      // Insert script tag
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    } else {
      // API already loaded, initialize player immediately
      initializePlayer();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoId]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div
        ref={playerRef}
        className="absolute inset-0 w-full h-full"
        title={title}
      />
    </div>
  );
}
