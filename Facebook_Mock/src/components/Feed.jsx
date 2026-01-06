import React from 'react';
import { useFeed } from '../hooks/useFeed';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Post from './Post';
import './Feed.css';

function Feed() {
  const { posts, loading, error, hasMore, loadMore } = useFeed();
  const lastPostElementRef = useInfiniteScroll(loadMore, hasMore, loading);

  if (error) {
    return (
      <div className="feed-error">
        <p>שגיאה בטעינת הפיד: {error}</p>
        <button onClick={() => window.location.reload()}>נסה שוב</button>
      </div>
    );
  }

  return (
    <div className="feed">
      {posts.length === 0 && !loading && (
        <div className="feed-empty">
          <p>אין פוסטים להצגה</p>
        </div>
      )}

      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostElementRef : null}
        >
          <Post post={post} />
        </div>
      ))}

      {loading && (
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>טוען פוסטים...</p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="feed-end">
          <p>סיימת לצפות בכל הפוסטים</p>
        </div>
      )}
    </div>
  );
}

export default Feed;
