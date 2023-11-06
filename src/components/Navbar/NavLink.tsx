import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import React from 'react';

interface Props extends LinkProps {
  active: boolean;
}

const NavLink: React.FC<PropsWithChildren<Props>> = ({
  active = false,
  children,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
        active
          ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300'
      }`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
