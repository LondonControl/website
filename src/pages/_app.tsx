import '../styles/global.css';

import type { AppProps } from 'next/app';
import React from 'react';

const MyApp = ({ Component, pageProps }: AppProps) => {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect;
  return <Component {...pageProps} />;
};

export default MyApp;
