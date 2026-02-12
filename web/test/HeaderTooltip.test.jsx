import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../src/Header';
import { ThemeProvider } from '../src/ThemeContext';
import '../src/index.css';

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
});
