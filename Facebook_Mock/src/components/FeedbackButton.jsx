import React from 'react';
//import icon from '../../imges/feedbackButton.png'
import icon from '../../imges/button.png'
import './FeedbackButton.css';
import { useNavigate } from 'react-router-dom';
import beSafeIcon from '../../imges/beSafe.png'


function FeedbackButton() {
    const navigate = useNavigate();
  return (
    <button
      className="floating-feedback-button"
      type="button"
      aria-label="Feedback"
      onClick={() => navigate('/feedback')}
    >
      <img
        className="floating-feedback-icon"
        src={beSafeIcon}
        alt="Feedback"
      />
    </button>
  );
}

export default FeedbackButton;
