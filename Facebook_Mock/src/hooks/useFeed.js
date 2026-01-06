import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = '/v17.0/me/home';
const DEFAULT_FIELDS = 'id,message,attachments,comments,created_time,from';
const DEFAULT_LIMIT = 10;

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

  const fetchPosts = useCallback(async (after = null, limit = DEFAULT_LIMIT) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        fields: DEFAULT_FIELDS,
        limit: limit.toString(),
      });

      if (after !== null) {
        params.append('after', after.toString());
      }

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        if (after === null) {
          // First load - replace posts
          setPosts(data.data);
        } else {
          // Load more - append posts
          setPosts(prev => [...prev, ...data.data]);
        }

        // Check if there's more data
        if (data.paging && data.paging.next) {
          // Extract cursor from next URL
          try {
            // Handle both absolute and relative URLs
            const nextUrlString = data.paging.next.startsWith('http') 
              ? data.paging.next 
              : `${window.location.origin}${data.paging.next}`;
            const nextUrl = new URL(nextUrlString);
            const nextAfter = nextUrl.searchParams.get('after');
            if (nextAfter) {
              setNextCursor(parseInt(nextAfter, 10));
              setHasMore(true);
            } else {
              setHasMore(false);
              setNextCursor(null);
            }
          } catch (e) {
            // Fallback: use data length
            const nextAfter = after === null ? data.data.length : after + data.data.length;
            setNextCursor(nextAfter);
            setHasMore(data.data.length === limit);
          }
        } else {
          setHasMore(false);
          setNextCursor(null);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor !== null) {
      fetchPosts(nextCursor);
    }
  }, [loading, hasMore, nextCursor, fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchPosts(),
  };
}
