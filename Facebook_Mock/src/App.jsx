import React from 'react';
import { AiFillHome } from 'react-icons/ai';
import { MdOndemandVideo, MdGroups } from 'react-icons/md';
import Feed from './components/Feed';
import './App.css';
import FeedbackButton from './components/FeedbackButton';
import { Routes, Route, useLocation } from 'react-router-dom';
import FeedbackPage from '../pages/FeedbackPage'
import FloatingToggle from './components/FloatingToggle';

function App() {
  const location = useLocation();
  const isFeedbackPage = location.pathname === '/feedback';

  return (
    <div className="app">
      {!isFeedbackPage && (
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-circle">f</div>
          </div>
          <div className="header-center" aria-hidden="true">
            <button className="nav-icon-button active" type="button">
              <AiFillHome className="nav-icon-svg" />
            </button>
            <button className="nav-icon-button" type="button">
              <MdOndemandVideo className="nav-icon-svg" />
            </button>
            <button className="nav-icon-button" type="button">
              <MdGroups className="nav-icon-svg" />
            </button>
          </div>
          <div className="header-right">
            <div className="header-profile-circle" />
          </div>
        </div>
      </header>
        )}

      <main className="app-main">
        <div className="app-main-inner">
          <aside className="app-main-side" aria-hidden="true" />
          <section className="app-main-center">

            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Routes>
            
            {!isFeedbackPage && (
            <div className="feedback-button-container">
              <FeedbackButton />
            </div>
            
            )}


            {isFeedbackPage && (
              <div className="floatingToggle">
                <FloatingToggle />
              </div>
            )}

          </section>
          <aside className="app-main-side" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}

export default App;
