/* eslint-disable import/no-extraneous-dependencies */
import {
  ClipboardList,
  Download,
  LogOut,
  MenuIcon,
  UserCog,
  UserIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';
import NavLink from '@/components/Navbar/NavLink';
import ResponsiveNavLink, {
  ResponsiveNavButton,
} from '@/components/Navbar/ResponsiveNavLink';
import ShoppingBasketDrawer from '@/components/ShoppingBasketDrawer';
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
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';

interface Props {}

const Navigation: React.FC<Props> = () => {
  const router = useRouter();
  const { logout, user } = useAuth({ middleware: 'guest' });
  const [open, setOpen] = useState<boolean>(false);
  const { cartItems } = useCart();

  return (
    <nav className="bg-white">
      {/* Primary Navigation Menu */}
      <div className="mx-auto max-w-site px-4 py-3 tablet:px-6 laptop:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="-mt-3">
            <Link href="/">
              <ApplicationLogo className="block h-6 w-auto" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center space-x-4 laptop:flex">
            <NavLink href="/products">Products</NavLink>

            <NavLink href="/documents">Documents</NavLink>

            <NavLink href="/utilities">Utilities</NavLink>

            <NavLink href="/news">News</NavLink>

            <NavLink href="https://forum.londoncontrol.com">Forum</NavLink>

            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Settings Dropdown */}
          <div
            className={`hidden laptop:flex ${user ? 'laptop:pl-[86px]' : 'laptop:pl-16'}`}
          >
            <div className="relative flex items-center space-x-2">
              {user ? (
                <>
                  <ShoppingBasketDrawer />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <UserIcon className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/orders" className="hover:cursor-pointer">
                            <ClipboardList className="mr-2 size-4" />
                            <span>Orders</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/downloads"
                            className="hover:cursor-pointer"
                          >
                            <Download className="mr-2 size-4" />
                            <span>Downloads</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile"
                            className="hover:cursor-pointer"
                          >
                            <UserCog className="mr-2 size-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={logout}
                        className="hover:cursor-pointer"
                      >
                        <LogOut className="mr-2 size-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link
                      href="/register"
                      className="text-sm font-semibold leading-6"
                    >
                      Register{' '}
                      <span aria-hidden="true" className="ml-2">
                        →
                      </span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Hamburger */}
          <div className="-mr-2 flex items-center laptop:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((current) => !current)}
            >
              {open ? (
                <XIcon className="size-6" />
              ) : (
                <MenuIcon className="size-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Responsive Navigation Menu */}
      {open && (
        <div className="block laptop:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <ResponsiveNavLink
              href="/products"
              active={router.pathname === '/products'}
            >
              Products
            </ResponsiveNavLink>

            <ResponsiveNavLink
              href="/documents"
              active={router.pathname === '/documents'}
            >
              Documents
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

            {user && (
              <ResponsiveNavLink
                href="/checkout"
                active={router.pathname === '/checkout'}
              >
                Checkout
                {cartItems.length > 0 && (
                  <span className="ml-2">{cartItems.length}</span>
                )}
              </ResponsiveNavLink>
            )}
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
                    href="/downloads"
                    active={router.pathname === '/downloads'}
                  >
                    Downloads
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
