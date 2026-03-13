import { render, screen } from '@testing-library/react';

import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders the eyebrow text', () => {
    render(<PageHeader eyebrow="Account" title="Profile" />);

    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders the title as an h1', () => {
    render(<PageHeader eyebrow="Account" title="Profile" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Profile' }),
    ).toBeInTheDocument();
  });

  it('renders different eyebrow and title values', () => {
    render(<PageHeader eyebrow="Updates" title="News" />);

    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'News' }),
    ).toBeInTheDocument();
  });

  it('has a bottom border', () => {
    render(<PageHeader eyebrow="Test" title="Test" />);

    expect(screen.getByTestId('page-header')).toHaveClass('border-b');
  });
});
