import { useEffect, useRef } from 'react';

export function useVideoAutoPlay() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible - play it
            video.play().catch((err) => {
              // Auto-play might be blocked by browser
              console.log('Auto-play prevented:', err);
            });
          } else {
            // Video is not visible - pause it
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // At least 50% visible
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  return videoRef;
}
