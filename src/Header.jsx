import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeContext';
import { clearCache } from './store/parkingStore';

const Header = ({ title, shortTitle, icon, onRefresh, updateStatus, currentView, setView, children }) => {
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="header-controls" role="banner">
      <div className="header-title-group">
        <h1>
          <span className="title-icon" role="img" aria-label={`${title} icon`}>{icon}</span>
          <span className="title-text-full"> {title}</span>
          <span className="title-text-short"> {shortTitle || title}</span>
        </h1>
        <div className="status-info" role="status" aria-live="polite">{updateStatus}</div>
      </div>
      <div className="header-actions" role="navigation" aria-label="Main navigation">
        {/* Extra actions like Palette Selector */}
        {children}

        {(() => {
          const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
          const showClear = params.has('clear_cache');
          if (showClear) {
            return (
              <button className="nav-btn" onClick={() => clearCache()} aria-label="Clear cache">
                <span className="btn-icon" role="img" aria-label="Broom icon">🧹</span>
                <span className="btn-text">Clear Cache</span>
              </button>
            );
          }
          return onRefresh ? (
            <button className="nav-btn" onClick={onRefresh} aria-label="Refresh data">
              <span className="btn-icon" role="img" aria-label="Refresh icon">⟳</span>
              <span className="btn-text">Refresh</span>
            </button>
          ) : null;
        })()}

        {currentView === 'stats' && (
          <button className="nav-btn" onClick={() => setView('dashboard')} aria-label="Go to dashboard">
            <span className="btn-icon" role="img" aria-label="Home icon">🏠</span>
            <span className="btn-text">Dashboard</span>
          </button>
        )}

        {currentView === 'dashboard' && (
          <button className="nav-btn" onClick={() => setView('stats')} aria-label="Go to statistics">
            <span className="btn-icon" role="img" aria-label="Chart icon">📊</span>
            <span className="btn-text">Statistics</span>
          </button>
        )}

        <button className="theme-toggle" onClick={toggleTheme} aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}>
          {isLight ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  shortTitle: PropTypes.string,
  icon: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
  updateStatus: PropTypes.string.isRequired,
  currentView: PropTypes.oneOf(['dashboard', 'stats']).isRequired,
  setView: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default Header;
