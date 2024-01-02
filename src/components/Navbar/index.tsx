/* eslint-disable import/no-extraneous-dependencies */
import { Label } from '@radix-ui/react-label';
import {
  ChevronDownIcon,
  ClipboardList,
  LogOut,
  ShoppingCart,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';
import NavLink from '@/components/Navbar/NavLink';
import ResponsiveNavLink, {
  ResponsiveNavButton,
} from '@/components/Navbar/ResponsiveNavLink';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
          <div className="hidden items-center space-x-4 tablet:flex">
            <NavLink href="/products">Products</NavLink>

            <NavLink href="/about">About</NavLink>

            <NavLink href="/news">News</NavLink>

            <NavLink href="https://forum.londoncontrol.com">Forum</NavLink>

            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Settings Dropdown */}
          <div className="hidden tablet:flex tablet:items-center">
            <div className="relative flex items-center space-x-2">
              {user ? (
                <>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>

                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Basket</SheetTitle>
                      </SheetHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value="Pedro Duarte"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input
                            id="username"
                            value="@peduarte"
                            className="col-span-3"
                          />
                        </div>
                      </div>

                      <SheetFooter>
                        <SheetClose asChild>
                          <Button asChild className="w-full">
                            <Link href="/checkout">Go to checkout</Link>
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <span>{user?.name}</span>
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/orders" className="hover:cursor-pointer">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            <span>Orders</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile"
                            className="hover:cursor-pointer"
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={logout}
                        className="hover:cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
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
              href="/contact"
              active={router.pathname === '/contact'}
            >
              Contact
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
