import React from 'react';
//import icon from '../../imges/feedbackButton.png'
import icon from '../../imges/button.png'
import './FeedbackButton.css';

function FeedbackButton() {
  return (
    <button
      className="floating-feedback-button"
      type="button"
      aria-label="Analytics"
    >
      <img
        className="floating-feedback-icon"
        src={icon}
        alt="Analytics"
      />
    </button>
  );
}

export default FeedbackButton;
