import '../styles/global.css';

// eslint-disable-next-line import/no-extraneous-dependencies
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import React from 'react';

import { CartProvider } from '@/context/CartContext';
import { inter, jetbrainsMono } from '@/lib/fonts';

const MyApp = ({ Component, pageProps }: AppProps) => {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect;
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <CartProvider>
        <Component {...pageProps} />
        <SpeedInsights />
      </CartProvider>
    </div>
  );
};

export default MyApp;
