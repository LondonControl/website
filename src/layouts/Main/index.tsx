import type { ReactNode } from 'react';
import React from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

interface Props {
  meta: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

const MainLayout: React.FC<Props> = (props) => {
  return (
    <div className="min-h-screen w-full">
      {props.meta}

      <Navbar />

      {props.header && (
        <header className="bg-white shadow">
          <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
            {props.header}
          </div>
        </header>
      )}

      <main>{props.children}</main>

      <Footer />
    </div>
  );
};

export default MainLayout;
