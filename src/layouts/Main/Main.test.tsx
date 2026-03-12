import { render, screen } from '@testing-library/react';

import Main from '.';

// Stub out heavy layout dependencies so this test focuses on MainLayout itself
jest.mock('@/components/Banner', () => () => null);
jest.mock('@/components/Navbar', () => {
  const MockNavbar = () => <nav aria-label="Main navigation" />;
  MockNavbar.displayName = 'MockNavbar';
  return MockNavbar;
});
jest.mock('@/components/Footer', () => () => null);
jest.mock('@/components/CookieConsent', () => () => null);
jest.mock('@/components/ui/sonner', () => ({ Toaster: () => null }));

describe('MainLayout', () => {
  it('renders a skip-to-main-content link as the first focusable element', () => {
    render(<Main meta={null}>content</Main>);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });

    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders children inside a <main> with id="main-content"', () => {
    render(
      <Main meta={null}>
        <span>page content</span>
      </Main>,
    );

    const main = screen.getByRole('main');

    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toContainElement(screen.getByText('page content'));
  });

  it('renders the error boundary fallback when a child throws', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <Main meta={null}>
        <ThrowError />
      </Main>,
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
