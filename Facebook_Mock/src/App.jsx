import React from 'react';
import { AiFillHome } from 'react-icons/ai';
import { MdOndemandVideo, MdGroups } from 'react-icons/md';
import Feed from './components/Feed';
import './App.css';

function App() {
  return (
    <div className="app">
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
      <main className="app-main">
        <div className="app-main-inner">
          <aside className="app-main-side" aria-hidden="true" />
          <section className="app-main-center">
            <Feed />
          </section>
          <aside className="app-main-side" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}

export default App;
