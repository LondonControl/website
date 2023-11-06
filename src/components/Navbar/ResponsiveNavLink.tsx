import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

interface Props extends LinkProps {
  active?: boolean;
}

const ResponsiveNavLink: React.FC<PropsWithChildren<Props>> = ({
  active = false,
  children,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={`flex w-full items-start border-l-4 py-2 pl-3 pr-4 ${
        active
          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 dark:border-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 dark:focus:border-indigo-300 dark:focus:bg-indigo-900 dark:focus:text-indigo-200'
          : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:border-gray-600 dark:focus:bg-gray-700 dark:focus:text-gray-200'
      } text-base font-medium transition duration-150 ease-in-out focus:outline-none`}
    >
      {children}
    </Link>
  );
};

export const ResponsiveNavButton: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  return (
    <button
      className="flex w-full items-start border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 transition duration-150 ease-in-out hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:border-gray-600 dark:focus:bg-gray-700 dark:focus:text-gray-200"
      {...props}
    />
  );
};

export default ResponsiveNavLink;
