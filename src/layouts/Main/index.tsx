import type { ReactNode } from 'react';
import React from 'react';

import Banner from '@/components/Banner';
import CookieConsent from '@/components/CookieConsent';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

interface Props {
  meta: ReactNode;
  children: ReactNode;
}

const MainLayout: React.FC<Props> = (props) => {
  return (
    <div className="min-h-screen w-full">
      {props.meta}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <Banner />

      <Navbar />

      <ErrorBoundary>
        <main id="main-content">{props.children}</main>
      </ErrorBoundary>

      <Toaster />

      <CookieConsent />

      <Footer />
    </div>
  );
};

export default MainLayout;
