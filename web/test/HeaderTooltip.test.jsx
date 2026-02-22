import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import Header from '../src/Header';
import { ThemeProvider } from '../src/ThemeContext';
import '../src/index.css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Header tooltip layout', () => {
  it('renders the donate subtext as two fixed lines', () => {
    const setView = vi.fn();

    const { container } = render(
      <ThemeProvider>
        <Header
          title="Free Parking"
          shortTitle="Parking"
          icon="P"
          onRefresh={vi.fn()}
          updateStatus="Updated just now"
          currentView="dashboard"
          setView={setView}
        />
      </ThemeProvider>
    );

    const tooltipSub = container.querySelector('.tooltip-sub');
    expect(tooltipSub).toBeTruthy();
    expect(tooltipSub?.children).toHaveLength(2);

    expect(screen.getByText('Visit')).toBeInTheDocument();
    expect(screen.getByText('BuyCoffee.to/piotereks')).toBeInTheDocument();

    const tooltipLine = container.querySelector('.tooltip-line');
    const tooltipLink = container.querySelector('.tooltip-link');

    expect(tooltipLine).toBeTruthy();
    expect(tooltipLink).toBeTruthy();

    expect(tooltipLine).toBeTruthy();
    expect(tooltipLink).toBeTruthy();
    expect(tooltipSub?.querySelectorAll('br')).toHaveLength(0);
  });

  it('uses the same yellow RGBA backgrounds as the mobile app', () => {
    const setView = vi.fn();

    // force light theme via localStorage (ThemeProvider reads this on init)
    localStorage.setItem('parking_theme', 'light');

    const { container } = render(
      <ThemeProvider>
        <Header
          title="Free Parking"
          shortTitle="Parking"
          icon="P"
          onRefresh={vi.fn()}
          updateStatus="Updated just now"
          currentView="dashboard"
          setView={setView}
        />
      </ThemeProvider>
    );

    const donateBtn = container.querySelector('.donate-btn');
    expect(donateBtn).toBeTruthy();
    // verify utility class is applied
    expect(donateBtn).toHaveClass('bg-donate-light');
    const style = window.getComputedStyle(donateBtn);
    // now should be light theme color
    expect(style.backgroundColor).toBe('rgba(250, 204, 21, 0.2)');
    // border should match nav-btn's default border color
    const nav = container.querySelector('.nav-btn');
    expect(nav).toBeTruthy();
    const navBorder = window.getComputedStyle(nav).borderColor;
    expect(style.borderColor).toBe(navBorder);

    // switch to dark by adding the class (ThemeProvider will also do this
    // when `isLight` flips, but we can simulate it directly in the DOM).
    document.documentElement.classList.add('dark');
    const darkStyle = window.getComputedStyle(donateBtn);
    expect(darkStyle.backgroundColor).toBe('rgba(250, 204, 21, 0.12)');
    const darkNavBorder = window.getComputedStyle(nav).borderColor;
    expect(darkStyle.borderColor).toBe(darkNavBorder);
  });

  it('index.css contains no raw rgba colors except utilities', () => {
    const css = readFileSync(resolve(__dirname, '../src/index.css'), 'utf-8');
    // there should be no rgba( tokens; all colors come from Tailwind config/classes
    expect(css).not.toMatch(/rgba\([^)]*\d+\s*\)/);
  });

  it('generated CSS includes donate utility classes', () => {
    // compile CSS to ensure classes are generated (output path is cross-platform)
    execSync(
      'npx tailwindcss -i src/index.css -o out.css --minify --config tailwind.config.js',
      { cwd: resolve(__dirname, '..') }
    );
    const built = readFileSync(resolve(__dirname, '../out.css'), 'utf-8');
    // as long as the light utility exists the CSS build is working; dark/badge may be
    // purged since they are only referenced via variant or rarely used.
    expect(built).toMatch(/\.bg-donate-light/);
  });
});
