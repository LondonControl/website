/* eslint-disable import/no-extraneous-dependencies */
import { hasCookie, setCookie } from 'cookies-next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    setVisible(!hasCookie('cookieNoticeDismissed'));
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setCookie('cookieNoticeDismissed', 'true', { maxAge: 60 * 60 * 24 * 365 });
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto mx-auto flex max-w-2xl items-center justify-between gap-6 rounded-xl border border-border bg-card px-6 py-4 shadow-2xl">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use essential cookies to enhance your browsing experience, by using
          this site you agree to our{' '}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
          >
            policy.
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 cursor-pointer text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
