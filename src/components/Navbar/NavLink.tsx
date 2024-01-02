import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface Props extends LinkProps {}

const NavLink: React.FC<PropsWithChildren<Props>> = ({
  children,
  ...props
}) => {
  return (
    <Button variant="ghost" asChild>
      <Link {...props} className="text-sm font-semibold leading-5">
        {children}
      </Link>
    </Button>
  );
};

export default NavLink;
