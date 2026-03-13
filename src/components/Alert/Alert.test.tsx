import { render, screen } from '@testing-library/react';

import Alert from '.';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert type="info">Test message</Alert>);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('has role="status" for info type', () => {
    render(<Alert type="info">Info</Alert>);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has role="alert" for warning type', () => {
    render(<Alert type="warning">Warning</Alert>);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has role="alert" for caution type', () => {
    render(<Alert type="caution">Caution</Alert>);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hides the icon from screen readers', () => {
    render(<Alert type="info">Info</Alert>);
    const iconWrapper = screen.getByTestId('alert-icon');

    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
  });
});
