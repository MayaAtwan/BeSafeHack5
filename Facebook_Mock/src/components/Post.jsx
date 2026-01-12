import React, { useEffect, useRef, useState } from 'react';
import UserAvatar from './UserAvatar';
import PostMedia from './PostMedia';
import Comments from './Comments';
import { formatPostTime } from '../utils/dateUtils';
import './Post.css';

function Post({ post, exposeLegitimacy = false, isLegit = true }) {
  const {
    id,
    message,
    from,
    created_time,
    attachments,
    comments,
  } = post;

  const postRef = useRef(null);

  const hasSentViewEventRef = useRef(false);
  const visibleStartRef = useRef(null);
  const totalVisibleMsRef = useRef(0);
  const maxVisibleRatioRef = useRef(0);
  const videoWatchMsRef = useRef(0);

  const [openedComments, setOpenedComments] = useState(false);
  const hasSentCommentsEventRef = useRef(false);

  const postTime = created_time ? formatPostTime(created_time) : '';

  const finalizeVisibilityTime = () => {
    if (visibleStartRef.current !== null) {
      const now = performance.now();
      totalVisibleMsRef.current += now - visibleStartRef.current;
      visibleStartRef.current = null;
    }
  };

  const sendEvent = async (forceOpenedComments = null) => {
    if (!id) return;

    finalizeVisibilityTime();

    const visiblePercentage = Math.round(
      Math.min(1, Math.max(0, maxVisibleRatioRef.current)) * 100
    );

    const eventPayload = {
      userId: 'u1',
      timestamp: Date.now(),
      post: post,
      view: {
        visiblePercentage,
        durationMs: Math.round(totalVisibleMsRef.current),
        videoWatchedMs: Math.round(videoWatchMsRef.current),
        openedComments:
          forceOpenedComments !== null ? forceOpenedComments : openedComments
      }
    };

    try {
      await fetch('http://localhost:3000/events/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });
    } catch (err) {
      console.error('Failed to send event to server:', err);
    }

    if (forceOpenedComments === null) {
      hasSentViewEventRef.current = true;
    }
  };

  useEffect(() => {
    const element = postRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        const ratio = entry.intersectionRatio;
        const now = performance.now();

        if (entry.isIntersecting) {
          if (ratio > maxVisibleRatioRef.current) {
            maxVisibleRatioRef.current = ratio;
          }
          if (visibleStartRef.current === null) {
            visibleStartRef.current = now;
          }
        } else {
          if (visibleStartRef.current !== null) {
            totalVisibleMsRef.current += now - visibleStartRef.current;
            visibleStartRef.current = null;
          }

          if (!hasSentViewEventRef.current && totalVisibleMsRef.current > 0) {
            hasSentViewEventRef.current = true;
            sendEvent().catch(err =>
              console.error('Failed to send view event on scroll', err)
            );
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (
        !hasSentViewEventRef.current &&
        (visibleStartRef.current !== null || totalVisibleMsRef.current > 0)
      ) {
        sendEvent().catch(err =>
          console.error('Failed to send unmount view event', err)
        );
      }
    };
  }, [id, openedComments]);

  const handleVideoWatchTimeChange = totalMs => {
    videoWatchMsRef.current = totalMs;
  };

  const handleCommentsOpened = () => {
    if (!openedComments) {
      setOpenedComments(true);
    }

    if (!hasSentCommentsEventRef.current) {
      hasSentCommentsEventRef.current = true;
      sendEvent(true).catch(err =>
        console.error('Failed to send comments-opened event', err)
      );
    }
  };

  const commentCount = comments?.data?.length || 0;
  const likeCount = Math.max(1, commentCount * 3 + 8);
  const shareCount = Math.max(0, Math.floor(commentCount / 2));

  const postClassName = `post ${
    localStorage.getItem("exposeLegitimacy") === "ON"
      ? (isLegit ? 'post-legit' : 'post-not-legit')
      : ''
  }`;

  return (
    <article className={postClassName} ref={postRef}>
      <div className="post-header">
        <div className="post-header-info">
          <UserAvatar name={from?.name || 'Unknown'} />
          <div className="post-author-info">
            <div className="post-author-name">{from?.name || 'Unknown'}</div>
            {postTime && <div className="post-time">{postTime}</div>}
          </div>
        </div>
      </div>

      {message && (
        <div className="post-content">
          <p className="post-message">{message}</p>
        </div>
      )}

      {attachments?.data?.length > 0 && (
        <PostMedia
          attachments={attachments.data}
          onVideoWatchTimeChange={handleVideoWatchTimeChange}
        />
      )}

      {comments?.data?.length > 0 && (
        <Comments
          comments={comments.data}
          postId={id}
          onOpenComments={handleCommentsOpened}
        />
      )}

      <div className="post-meta">
        <div className="post-meta-counts">
          <span className="post-likes-count">
            👍 {likeCount.toLocaleString('he-IL')}
          </span>
          {commentCount > 0 && (
            <span className="post-comments-count">
              {commentCount.toLocaleString('he-IL')} תגובות
            </span>
          )}
          {shareCount > 0 && (
            <span className="post-shares-count">
              · {shareCount.toLocaleString('he-IL')} שיתופים
            </span>
          )}
        </div>
      </div>

      <div className="post-actions">
        <button type="button" className="post-action-btn">לייק</button>
        <button type="button" className="post-action-btn">תגובה</button>
        <button type="button" className="post-action-btn">שיתוף</button>
      </div>
    </article>
  );
}

export default Post;
