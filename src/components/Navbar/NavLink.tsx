import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface Props extends LinkProps {
  active: boolean;
}

const NavLink: React.FC<PropsWithChildren<Props>> = ({
  active = false,
  children,
  ...props
}) => {
  return (
    <Button variant="ghost" asChild>
      <Link
        {...props}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold leading-5 text-gray-900 transition duration-150 ease-in-out focus:outline-none ${
          active ? 'text-blue-600' : 'hover:text-gray-600'
        }`}
      >
        {children}
      </Link>
    </Button>
  );
};

export default NavLink;
