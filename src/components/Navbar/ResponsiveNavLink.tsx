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
          ? 'border-gray-900 bg-gray-200 text-gray-900 focus:border-gray-900 focus:bg-gray-200'
          : 'border-transparent text-gray-900 hover:border-gray-700 hover:bg-gray-100 hover:text-gray-700 focus:border-gray-700 focus:bg-gray-100 focus:text-gray-800'
      } text-base font-semibold transition duration-150 ease-in-out focus:outline-none`}
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
      className="flex w-full items-start border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-semibold text-gray-900 transition duration-150 ease-in-out hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none"
      {...props}
    />
  );
};

export default ResponsiveNavLink;
