import { render, screen } from '@testing-library/react';

import Index from '@/pages/index';

// The easiest solution to mock `next/router`: https://github.com/vercel/next.js/issues/7479
// The mock has been moved to `__mocks__` folder to avoid duplication

describe('Index (landing) page', () => {
  it('renders without crashing', () => {
    render(<Index />);
  });

  it('renders the main h1 heading', () => {
    render(<Index />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the Pricing section heading', () => {
    render(<Index />);

    expect(
      screen.getByRole('heading', { name: /choose the right option/i }),
    ).toBeInTheDocument();
  });

  it('renders the FAQ section heading', () => {
    render(<Index />);

    expect(
      screen.getByRole('heading', { name: /frequently asked/i }),
    ).toBeInTheDocument();
  });

  it('renders a Register link', () => {
    render(<Index />);

    const registerLinks = screen.getAllByRole('link', { name: /register/i });

    expect(registerLinks.length).toBeGreaterThan(0);
  });
});
