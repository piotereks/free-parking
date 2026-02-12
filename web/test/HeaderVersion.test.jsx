import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../src/Header';
import { ThemeProvider } from '../src/ThemeContext';

describe('Header version badge', () => {
  it('shows readable version from package.json fallback', () => {
    // emulate package.json version fallback
    process.env.npm_package_version = '9.9.9-test';

    render(
      <ThemeProvider>
        <Header
          title="Free Parking"
          shortTitle="Parking"
          icon="P"
          onRefresh={() => {}}
          updateStatus="ok"
          currentView="dashboard"
          setView={() => {}}
        />
      </ThemeProvider>
    );

    const v = screen.getByText(/v9\.9\.9-test/);
    expect(v).toBeInTheDocument();
  });

  it('header snapshot includes version badge', () => {
    process.env.npm_package_version = '9.9.9-snap';
    const { container } = render(
      <ThemeProvider>
        <Header
          title="Free Parking"
          shortTitle="Parking"
          icon="P"
          onRefresh={() => {}}
          updateStatus="ok"
          currentView="dashboard"
          setView={() => {}}
        />
      </ThemeProvider>
    );

    expect(container).toMatchSnapshot();
  });
});
