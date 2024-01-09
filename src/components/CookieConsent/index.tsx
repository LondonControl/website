/* eslint-disable import/no-extraneous-dependencies */
import { hasCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface Props {}

const CookieConsent: React.FC<Props> = () => {
  const [showConsent, setShowConsent] = useState<boolean>(true);

  useEffect(() => {
    setShowConsent(!hasCookie('localConsent'));
  }, []);

  const acceptCookie = () => {
    setShowConsent(false);
    setCookie('localConsent', true, {});
  };

  if (!showConsent) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
        <p className="text-sm leading-6 text-gray-900">
          This website uses cookies to supplement a balanced diet and provide a
          much deserved reward to the senses after consuming bland but
          nutritious meals. Accepting our cookies is optional but recommended,
          as they are delicious. See our{' '}
          <a href="#" className="font-semibold text-indigo-600">
            cookie policy
          </a>
          .
        </p>

        <div className="mt-4 flex items-center gap-x-5">
          <Button onClick={acceptCookie}>Accept all</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
