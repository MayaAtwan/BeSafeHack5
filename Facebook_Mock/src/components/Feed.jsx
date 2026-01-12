import React, { useState, useMemo } from 'react';
import { useFeed } from '../hooks/useFeed';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Post from './Post';
import { getPostsLegitimacyMap } from '../utils/postLegitimacy';
import './Feed.css';

function Feed() {
  const { posts, loading, error, hasMore, loadMore } = useFeed();
  const lastPostElementRef = useInfiniteScroll(loadMore, hasMore, loading);
  const [exposeLegitimacy, setExposeLegitimacy] = useState(false);
  
  const postsLegitimacyMap = useMemo(() => {
    return getPostsLegitimacyMap(posts);
  }, [posts]);

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
      <div className="feed-controls">
        <label className="legitimacy-toggle-wrapper">
          <span className="toggle-label">חשוף אם פוסטים לגיטימיים</span>
          <div 
            className={`legitimacy-toggle ${exposeLegitimacy ? 'active' : ''}`}
            onClick={() => setExposeLegitimacy(!exposeLegitimacy)}
            role="switch"
            aria-checked={exposeLegitimacy}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExposeLegitimacy(!exposeLegitimacy);
              }
            }}
          >
            <div className="toggle-slider"></div>
          </div>
        </label>
      </div>

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
          <Post 
            post={post} 
            exposeLegitimacy={exposeLegitimacy}
            isLegit={postsLegitimacyMap[post.id]}
          />
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
