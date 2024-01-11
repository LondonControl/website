/* eslint-disable import/no-extraneous-dependencies */
import { hasCookie, setCookie } from 'cookies-next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface Props {}

const CookieConsent: React.FC<Props> = () => {
  const [hideConsent, setHideConsent] = useState<boolean>(true);

  useEffect(() => {
    setHideConsent(hasCookie('localConsent'));
  }, []);

  const acceptCookie = () => {
    setHideConsent(true);
    setCookie('localConsent', true, {});
  };

  if (hideConsent) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
        <p className="text-sm leading-6 text-gray-900">
          We use cookies to enhance your browsing experience, serve personalised
          ads or content, and analyse our traffic. By clicking accept all and
          using this site you agree to our{' '}
          <Link href="/privacy" className="font-bold hover:underline">
            cookie policy
          </Link>
          .
        </p>

        <div className="mt-4 flex items-center justify-end gap-x-5">
          <Button onClick={acceptCookie}>Accept all</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
