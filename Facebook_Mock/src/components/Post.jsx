import React, { useEffect, useRef, useState } from 'react';
import UserAvatar from './UserAvatar';
import PostMedia from './PostMedia';
import Comments from './Comments';
import { formatPostTime } from '../utils/dateUtils';
import { saveEventLocally } from "../client-data/eventStoreClient.js";
import './Post.css';

function Post({ post }) {
  const {
    id,
    message,
    from,
    created_time,
    attachments,
    comments,
  } = post;

  const postRef = useRef(null);

  // האם כבר שלחנו view לפוסט הזה?
  const hasSentViewEventRef = useRef(false);

  // מדידת זמן חשיפה
  const visibleStartRef = useRef(null);
  const totalVisibleMsRef = useRef(0);

  // מדידת אחוז חשיפה מקסימלי
  const maxVisibleRatioRef = useRef(0);

  // מדידת זמן צפייה בוידאו
  const videoWatchMsRef = useRef(0);

  // האם המשתמש פתח תגובות
  const [openedComments, setOpenedComments] = useState(false);
  const hasSentCommentsEventRef = useRef(false);

  const postTime = created_time ? formatPostTime(created_time) : '';

  // עוצר את מדידת הזמן ומוסיף אותו לסך הכול
  const finalizeVisibilityTime = () => {
    if (visibleStartRef.current !== null) {
      const now = performance.now();
      totalVisibleMsRef.current += now - visibleStartRef.current;
      visibleStartRef.current = null;
    }
  };

  // Save event locally
  function trackViewEvent(event) {
    console.log("Saving event locally:", event);
    saveEventLocally(event);
  }

  // Send view event locally
  const sendEvent = async (forceOpenedComments = null) => {
    if (!id) return;

    finalizeVisibilityTime();

    const visiblePercentage = Math.round(
      Math.min(1, Math.max(0, maxVisibleRatioRef.current)) * 100
    );

    const eventPayload = {
      userId: 'u1',
      postId: id,
      visiblePercentage,
      durationMs: Math.round(totalVisibleMsRef.current),
      videoWatchedMs: Math.round(videoWatchMsRef.current),
      openedComments:
        forceOpenedComments !== null ? forceOpenedComments : openedComments,
      timestamp: Date.now(),
    };

    // Save event locally
    trackViewEvent(eventPayload);

    // Mark that we've sent the view event — don't send again
    if (forceOpenedComments === null) {
      hasSentViewEventRef.current = true;
    }
  };

  // מעקב חשיפה — כמו פייסבוק
  useEffect(() => {
    const element = postRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        const ratio = entry.intersectionRatio;
        const now = performance.now();

        if (entry.isIntersecting) {
          // עדכון אחוז חשיפה מקסימלי
          if (ratio > maxVisibleRatioRef.current) {
            maxVisibleRatioRef.current = ratio;
          }

          // התחלת מדידת זמן
          if (visibleStartRef.current === null) {
            visibleStartRef.current = now;
          }
        } else {
          // הפוסט יצא מהמסך — עוצרים מדידה
          if (visibleStartRef.current !== null) {
            totalVisibleMsRef.current += now - visibleStartRef.current;
            visibleStartRef.current = null;
          }

          // אם היה זמן חשיפה ועדיין לא שלחנו view — שולחים עכשיו
          if (!hasSentViewEventRef.current && totalVisibleMsRef.current > 0) {
            hasSentViewEventRef.current = true;
            sendEvent().catch(err =>
              console.error('Failed to send view event on scroll', err)
            );
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      // אם הפוסט הוסר מהמסך ועדיין לא שלחנו view — שולחים עכשיו
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

  // עדכון זמן צפייה בוידאו
  const handleVideoWatchTimeChange = totalMs => {
    videoWatchMsRef.current = totalMs;
  };

  // פתיחת תגובות
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

  return (
    <article className="post" ref={postRef}>
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
        <button type="button" className="post-action-btn">
          לייק
        </button>
        <button type="button" className="post-action-btn">
          תגובה
        </button>
        <button type="button" className="post-action-btn">
          שיתוף
        </button>
      </div>
    </article>
  );
}

export default Post;
