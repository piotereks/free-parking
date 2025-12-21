import React from 'react';
import { useTheme } from './ThemeContext';

const Header = ({ title, shortTitle, icon, onRefresh, updateStatus, currentView, setView, children }) => {
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="header-controls">
      <div className="header-title-group">
        <h1>
          <span className="title-icon">{icon}</span>
          <span className="title-text-full"> {title}</span>
          <span className="title-text-short"> {shortTitle || title}</span>
        </h1>
        <div className="status-info">{updateStatus}</div>
      </div>
      <div className="header-actions">
        {/* Extra actions like Palette Selector */}
        {children}

        {onRefresh && (
          <button className="nav-btn" onClick={onRefresh}>
            <span className="btn-icon">⟳</span>
            <span className="btn-text">Refresh</span>
          </button>
        )}

        {currentView === 'stats' && (
          <button className="nav-btn" onClick={() => setView('dashboard')}>
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Dashboard</span>
          </button>
        )}

        {currentView === 'dashboard' && (
          <button className="nav-btn" onClick={() => setView('stats')}>
            <span className="btn-icon">📊</span>
            <span className="btn-text">Statistics</span>
          </button>
        )}

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isLight ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
