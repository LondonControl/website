import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

const SecondaryLinkButton: React.FC<PropsWithChildren<LinkProps>> = ({
  href,
  children,
  ...props
}) => {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default SecondaryLinkButton;
