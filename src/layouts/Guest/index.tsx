import Head from 'next/head';
import type { PropsWithChildren } from 'react';
import React from 'react';

const GuestLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <Head>
        <title>Home | London Control</title>
      </Head>

      <div className="font-sans text-gray-900 antialiased">{children}</div>
    </div>
  );
};

export default GuestLayout;
