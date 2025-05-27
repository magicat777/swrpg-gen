import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check if the spinner SVG is present
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders in fullscreen mode', () => {
    render(<LoadingSpinner fullScreen />);
    
    // Check if the fullscreen container is present
    const container = screen.getByText('Loading...').closest('div');
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });

  it('applies custom size', () => {
    render(<LoadingSpinner size={48} />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveStyle({
      width: '48px',
      height: '48px',
    });
  });

  it('renders fullscreen with custom message', () => {
    render(<LoadingSpinner fullScreen message="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    
    // Should be in fullscreen container
    const container = screen.getByText('Please wait...').closest('div');
    expect(container).toHaveStyle({
      position: 'fixed',
    });
  });
});