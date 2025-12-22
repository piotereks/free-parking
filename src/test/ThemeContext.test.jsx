import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeContext';

describe('ThemeContext', () => {
  it('provides theme context to children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies dark theme by default', () => {
    localStorage.clear();
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    
    expect(document.body.classList.contains('dark')).toBe(true);
  });
});
