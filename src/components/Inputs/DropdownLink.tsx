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
        className={`group flex w-full items-center px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
          active ? 'bg-gray-100' : ''
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
        className={`group flex w-full items-center px-4 py-2 text-left text-sm leading-5 text-gray-900 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
          active ? 'bg-gray-100' : ''
        }`}
        {...props}
      >
        {children}
      </button>
    )}
  </Menu.Item>
);

export default DropdownLink;
