import React, { useState } from 'react';
import UserAvatar from './UserAvatar';
import './Comments.css';

function Comments({ comments, postId, onOpenComments }) {
  if (!comments || comments.length === 0) {
    return null;
  }

  const [showAll, setShowAll] = useState(false);

  // מציגים רק את 2 התגובות הראשונות, השאר מאחורי כפתור "הצג עוד" עד שלחצו
  const INITIAL_COUNT = 2;
  const visibleComments = showAll
    ? comments
    : comments.slice(0, INITIAL_COUNT);

  return (
    <div className="comments">
      {visibleComments.map((comment) => (
        <div key={comment.id} className="comment">
          <UserAvatar name={comment.from?.name || 'Unknown'} />
          <div className="comment-content">
            <div className="comment-author">{comment.from?.name || 'Unknown'}</div>
            <div className="comment-text">{comment.message}</div>
          </div>
        </div>
      ))}
      {comments.length > INITIAL_COUNT && !showAll && (
        <div className="comments-more">
          <button
            className="comments-more-button"
            onClick={() => {
              setShowAll(true);
              if (typeof onOpenComments === 'function') {
                onOpenComments(postId);
              }
            }}
          >
            הצג עוד {comments.length - INITIAL_COUNT} תגובות
          </button>
        </div>
      )}
    </div>
  );
}

export default Comments;
