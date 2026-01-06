import { useEffect, useRef } from 'react';

export function useInfiniteScroll(callback, hasMore, loading) {
  const observerRef = useRef(null);
  const lastPostElementRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (lastPostElementRef.current) {
      observerRef.current.observe(lastPostElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore, loading]);

  return lastPostElementRef;
}
