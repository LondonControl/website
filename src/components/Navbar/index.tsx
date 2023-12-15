import {
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';
import Dropdown from '@/components/Inputs/Dropdown';
import DropdownLink, { DropdownButton } from '@/components/Inputs/DropdownLink';
import NavLink from '@/components/Navbar/NavLink';
import ResponsiveNavLink, {
  ResponsiveNavButton,
} from '@/components/Navbar/ResponsiveNavLink';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  // user?: User;
}

const Navigation: React.FC<Props> = () => {
  const router = useRouter();
  const { logout, user } = useAuth({ middleware: 'guest' });
  const [open, setOpen] = useState<boolean>(false);

  return (
    <nav className="bg-white">
      {/* Primary Navigation Menu */}
      <div className="mx-auto max-w-site px-4 py-3 tablet:px-6 laptop:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link href="/">
                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden space-x-8 tablet:flex">
            <NavLink href="/products" active={router.pathname === '/products'}>
              Products
            </NavLink>

            <NavLink href="/about" active={router.pathname === '/about'}>
              About
            </NavLink>

            <NavLink href="/news" active={router.pathname === '/news'}>
              News
            </NavLink>

            <NavLink
              href="https://forum.londoncontrol.com"
              active={router.pathname === '/forum'}
            >
              Forum
            </NavLink>

            <NavLink href="/support" active={router.pathname === '/support'}>
              Support
            </NavLink>
          </div>

          {/* Settings Dropdown */}
          <div className="hidden tablet:ml-6 tablet:flex tablet:items-center">
            <div className="relative ml-3">
              {user ? (
                <Dropdown
                  align="right"
                  width="48"
                  trigger={
                    <span className="inline-flex rounded-md">
                      <button className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-900 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none">
                        {user?.name}

                        <svg
                          className="-mr-0.5 ml-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  }
                >
                  {/* Authentication */}
                  {/* TODO: add active state */}
                  <DropdownLink href="/orders">
                    <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
                    Orders
                  </DropdownLink>
                  <DropdownLink href="/profile">
                    <UserCircleIcon className="mr-3 h-5 w-5" />
                    Profile
                  </DropdownLink>

                  <hr />
                  <DropdownButton onClick={logout}>
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </DropdownButton>
                </Dropdown>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
                  >
                    Get Started <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <div className="-mr-2 flex items-center tablet:hidden">
            <button
              onClick={() => setOpen((current) => !current)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {open ? (
                  <path
                    className="inline-flex"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    className="inline-flex"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Navigation Menu */}
      {open && (
        <div className="block tablet:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <ResponsiveNavLink
              href="/products"
              active={router.pathname === '/products'}
            >
              Products
            </ResponsiveNavLink>

            <ResponsiveNavLink
              href="/about"
              active={router.pathname === '/about'}
            >
              About
            </ResponsiveNavLink>

            <ResponsiveNavLink
              href="/news"
              active={router.pathname === '/news'}
            >
              News
            </ResponsiveNavLink>

            <ResponsiveNavLink href="https://forum.londoncontrol.com">
              Forum
            </ResponsiveNavLink>

            <ResponsiveNavLink
              href="/support"
              active={router.pathname === '/support'}
            >
              Support
            </ResponsiveNavLink>
          </div>

          {/* Responsive Settings Options */}
          <div className="border-t border-gray-200 pb-1 pt-4">
            {user ? (
              <>
                <div className="px-4">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <ResponsiveNavLink
                    href="/orders"
                    active={router.pathname === '/orders'}
                  >
                    Orders
                  </ResponsiveNavLink>
                  <ResponsiveNavLink
                    href="/profile"
                    active={router.pathname === '/profile'}
                  >
                    Profile
                  </ResponsiveNavLink>
                  <ResponsiveNavButton onClick={logout}>
                    Logout
                  </ResponsiveNavButton>
                </div>
              </>
            ) : (
              <>
                <ResponsiveNavLink
                  href="/register"
                  active={router.pathname === '/register'}
                >
                  Get Started{' '}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </ResponsiveNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
