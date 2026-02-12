import PropTypes from 'prop-types';
import { useCallback, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';
import { clearCache } from './store/parkingStore';

import pkg from '../package.json';

const Header = ({ title, shortTitle, icon, onRefresh, updateStatus, currentView, setView, children }) => {
  const { isLight, toggleTheme } = useTheme();
  const version = pkg?.version || '0.0.0';
  const tooltipRef = useRef(null);
  const donateRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [tooltipPlacement, setTooltipPlacement] = useState('bottom');

  const positionTooltip = useCallback(() => {
    if (!tooltipRef.current || !donateRef.current) return;

    const tooltip = tooltipRef.current;
    const anchor = donateRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const wrapperRect = tooltip.parentElement?.getBoundingClientRect();
    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.left;
    if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - margin - tooltipRect.width;
    }
    if (left < margin) left = margin;

    let top = anchorRect.bottom + 8;
    let placement = 'bottom';
    if (top + tooltipRect.height > viewportHeight - margin) {
      const aboveTop = anchorRect.top - 8 - tooltipRect.height;
      if (aboveTop >= margin) {
        top = aboveTop;
        placement = 'top';
      } else {
        top = Math.max(margin, viewportHeight - margin - tooltipRect.height);
      }
    }

    const anchorCenter = anchorRect.left + anchorRect.width / 2;
    let arrowLeft = anchorCenter - left;
    const arrowPadding = 12;
    if (arrowLeft < arrowPadding) arrowLeft = arrowPadding;
    if (arrowLeft > tooltipRect.width - arrowPadding) arrowLeft = tooltipRect.width - arrowPadding;

    const relativeLeft = wrapperRect ? left - wrapperRect.left : left;
    const relativeTop = wrapperRect ? top - wrapperRect.top : top;

    setTooltipPlacement(placement);
    setTooltipStyle({
      left: `${Math.round(relativeLeft)}px`,
      top: `${Math.round(relativeTop)}px`,
      '--tooltip-arrow-left': `${Math.round(arrowLeft)}px`
    });
  }, []);

  const isImage = typeof icon === 'string' && (icon.endsWith('.png') || icon.endsWith('.svg') || icon.startsWith('/') || icon.startsWith('http'));

  return (
    <header className="header-controls" role="banner">
      <div className="header-title-group">
        <h1>
          {isImage ? (
            <img className="title-icon" src={icon} alt={`${title} icon`} />
          ) : (
            <span className="title-icon" role="img" aria-label={`${title} icon`}>{icon}</span>
          )}
          <span className="title-text-full"> {title}</span>
          <span className="title-text-short"> {shortTitle || title}</span>
        </h1>
        <div>
          <div className="status-info" role="status" aria-live="polite">{updateStatus}</div>
          <div className="status-version" aria-hidden="true">Version: {version}</div>
        </div>
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

        <div className="tooltip-wrapper" onMouseEnter={positionTooltip} onFocus={positionTooltip}>
          <a
            className="nav-btn donate-btn"
            href="https://buycoffee.to/piotereks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy coffe to — support development (opens in new tab)"
            aria-describedby="donate-tooltip"
            ref={donateRef}
            onMouseEnter={positionTooltip}
            onFocus={positionTooltip}
          >
            <span className="btn-text">Buy </span>
            <span className="donate-badge" aria-hidden="true">☕</span>
          </a>
          <div
            id="donate-tooltip"
            role="tooltip"
            className="tooltip-text"
            data-placement={tooltipPlacement}
            ref={tooltipRef}
            style={tooltipStyle}
          >
            <div>Support the project — small, one-time donations.</div>
            <div className="tooltip-sub">
              <span className="tooltip-line">Visit</span>
              <span className="tooltip-link">BuyCoffee.to/piotereks</span>
            </div>
          </div>
        </div>

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
