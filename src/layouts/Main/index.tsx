import type { ReactNode } from 'react';
import React from 'react';

import Navbar from '@/components/Navbar';

interface Props {
  meta: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

const MainLayout: React.FC<Props> = (props) => {
  // const { user } = useAuth({ middleware: 'guest' });

  return (
    <div className="min-h-screen w-full">
      {props.meta}

      {/* <Navbar user={user} /> */}

      <Navbar />

      {props.header && (
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {props.header}
          </div>
        </header>
      )}

      <main>{props.children}</main>

      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
