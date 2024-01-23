import type { ReactNode } from 'react';
import React from 'react';

import Banner from '@/components/Banner';
import CookieConsent from '@/components/CookieConsent';
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

      <Banner />

      <Navbar />

      <main>{props.children}</main>

      <Toaster />

      <CookieConsent />

      <Footer />
    </div>
  );
};

export default MainLayout;
