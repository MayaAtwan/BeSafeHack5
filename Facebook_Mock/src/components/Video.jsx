import React, { useRef } from 'react';
import { useVideoAutoPlay } from '../hooks/useVideoAutoPlay';
import './Video.css';

function Video({ src, alt, onWatchTimeChange }) {
  const videoRef = useVideoAutoPlay();

  const watchMsRef = useRef(0);
  const lastTimeRef = useRef(null);
  const isPlayingRef = useRef(false);

  const notifyWatchTime = () => {
    if (typeof onWatchTimeChange === 'function') {
      onWatchTimeChange(watchMsRef.current);
    }
  };

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlayingRef.current = true;
    lastTimeRef.current = video.currentTime * 1000;
  };

  const handlePause = () => {
    isPlayingRef.current = false;
    lastTimeRef.current = null;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !isPlayingRef.current || lastTimeRef.current === null) return;
    const currentMs = video.currentTime * 1000;
    if (currentMs > lastTimeRef.current) {
      watchMsRef.current += currentMs - lastTimeRef.current;
      lastTimeRef.current = currentMs;
      notifyWatchTime();
    }
  };

  const handleEnded = () => {
    isPlayingRef.current = false;
    lastTimeRef.current = null;
  };

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        src={src}
        className="post-video"
        controls
        playsInline
        muted
        loop
        preload="metadata"
        aria-label={alt}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      >
        הדפדפן שלך לא תומך בתגית וידאו.
      </video>
    </div>
  );
}

export default Video;
