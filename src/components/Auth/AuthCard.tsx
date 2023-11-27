import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';

const AuthCard: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col items-center pt-6 tablet:justify-center tablet:pt-0">
      <div>
        <Link href="/">
          <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
        </Link>
      </div>

      <div className="mt-6 w-full overflow-hidden px-6 py-4 tablet:max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
