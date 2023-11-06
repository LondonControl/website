import { Menu } from '@headlessui/react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

const DropdownLink: React.FC<PropsWithChildren<LinkProps>> = ({
  children,
  ...props
}) => (
  <Menu.Item>
    {({ active }) => (
      <Link
        {...props}
        className={`block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 ${
          active ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`}
      >
        {children}
      </Link>
    )}
  </Menu.Item>
);

export const DropdownButton: React.FC<
  PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
> = ({ children, ...props }) => (
  <Menu.Item>
    {({ active }) => (
      <button
        className={`block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800 ${
          active ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`}
        {...props}
      >
        {children}
      </button>
    )}
  </Menu.Item>
);

export default DropdownLink;
