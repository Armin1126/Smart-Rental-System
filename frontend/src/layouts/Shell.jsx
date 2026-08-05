import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="topbar-clock">
      {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      {' · '}
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
};

export const Shell = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="shell">
      <Sidebar />
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-search">
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                className="input input-with-icon"
                placeholder="Search assets, sites, operators…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="topbar-right">
            <LiveClock />

            <div className="topbar-pill">
              <span className="live-dot" style={{ background: 'var(--emerald)' }} />
              <span style={{ fontSize: '0.7rem' }}>Live</span>
            </div>

            <div className="topbar-pill">
              <span style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>⬛ CAT</span>
            </div>

            <div className="topbar-avatar">PK</div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
