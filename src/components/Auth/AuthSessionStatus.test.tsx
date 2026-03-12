import { render, screen } from '@testing-library/react';

import AuthSessionStatus from './AuthSessionStatus';

describe('AuthSessionStatus', () => {
  it('renders nothing when status is null', () => {
    const { container } = render(<AuthSessionStatus status={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when status is undefined', () => {
    const { container } = render(<AuthSessionStatus />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the status message when provided', () => {
    render(<AuthSessionStatus status="Email sent successfully" />);

    expect(screen.getByText('Email sent successfully')).toBeInTheDocument();
  });

  it('has role="status" for screen readers', () => {
    render(<AuthSessionStatus status="Success" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<AuthSessionStatus status="Success" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies a custom className', () => {
    render(<AuthSessionStatus status="Success" className="mb-4" />);

    expect(screen.getByRole('status')).toHaveClass('mb-4');
  });
});
