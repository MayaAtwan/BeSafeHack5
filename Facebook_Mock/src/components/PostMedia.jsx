import React from 'react';
import Video from './Video';
import './PostMedia.css';

function PostMedia({ attachments, onVideoWatchTimeChange }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="post-media">
      {attachments.map((attachment, index) => {
        if (attachment.type === 'video' && attachment.media?.source) {
          return (
            <Video
              key={index}
              src={attachment.media.source}
              alt="Video content"
              onWatchTimeChange={onVideoWatchTimeChange}
            />
          );
        } else if (attachment.type === 'photo' && attachment.media?.image?.src) {
          return (
            <img
              key={index}
              src={attachment.media.image.src}
              alt="Post content"
              className="post-image"
              loading="lazy"
            />
          );
        } else if (attachment.type === 'link' && attachment.url) {
          return (
            <a
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="post-link"
            >
              {attachment.url}
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

export default PostMedia;
