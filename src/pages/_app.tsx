import '../styles/global.css';

// eslint-disable-next-line import/no-extraneous-dependencies
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import React from 'react';

import { CartProvider } from '@/context/CartContext';

const MyApp = ({ Component, pageProps }: AppProps) => {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect;
  return (
    <CartProvider>
      <Component {...pageProps} />
      <SpeedInsights />
    </CartProvider>
  );
};

export default MyApp;
