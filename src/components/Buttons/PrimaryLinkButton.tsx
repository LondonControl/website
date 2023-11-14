import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

const PrimaryLinkButton: React.FC<PropsWithChildren<LinkProps>> = ({
  href,
  children,
  ...props
}) => {
  return (
    <Link
      href={href}
      {...props}
      className={`inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900`}
    >
      {children}
    </Link>
  );
};

export default PrimaryLinkButton;
