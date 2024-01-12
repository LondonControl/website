/* eslint-disable import/no-extraneous-dependencies */
import {
  ClipboardList,
  Download,
  LogOut,
  MenuIcon,
  ShoppingCart,
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import type CartItem from '@/interfaces/CartItem';

interface Props {}

const Navigation: React.FC<Props> = () => {
  const router = useRouter();
  const { logout, user } = useAuth({ middleware: 'guest' });
  const [open, setOpen] = useState<boolean>(false);
  const { cartItems, cartTotal, removeFromCart } = useCart();

  return (
    <nav className="bg-white">
      {/* Primary Navigation Menu */}
      <div className="mx-auto max-w-site px-4 py-3 tablet:px-6 laptop:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link href="/">
                <ApplicationLogo className="block h-6 w-auto fill-current text-gray-800" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center space-x-4 tablet:flex">
            <NavLink href="/products">Products</NavLink>

            <NavLink href="/news">News</NavLink>

            <NavLink href="https://forum.londoncontrol.com">Forum</NavLink>

            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Settings Dropdown */}
          <div className="hidden tablet:flex tablet:items-center laptop:pl-12">
            <div className="relative flex items-center space-x-2">
              {user ? (
                <>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" className="space-x-2">
                        <ShoppingCart className="h-5 w-5" />
                        {cartItems.length > 0 && (
                          <span>{cartItems.length}</span>
                        )}
                      </Button>
                    </SheetTrigger>

                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Basket</SheetTitle>
                      </SheetHeader>

                      <ul className="mt-4">
                        {cartItems.map((item: CartItem) => (
                          <li
                            key={item.product.id}
                            className="flex space-x-6 py-2"
                          >
                            <img
                              src="https://placehold.co/50x50?text=LC"
                              alt={item.product.title}
                              className="h-24 w-24 flex-none rounded-md bg-gray-200 object-cover object-center"
                            />

                            <div className="flex flex-col justify-between space-y-4">
                              <div className="space-y-1 text-sm font-medium">
                                <h3 className="text-gray-900">
                                  {item.product.title}
                                </h3>

                                <p className="text-gray-900">
                                  £{item.product.price / 100}
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="link"
                                className="-ml-4"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-900">
                        <span className="text-base">Total</span>
                        <span className="text-base">£{cartTotal / 100}</span>
                      </p>

                      <SheetFooter>
                        <SheetClose asChild>
                          <Button asChild className="mt-6 w-full">
                            <Link href="/checkout">Go to checkout</Link>
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <UserIcon className="h-5 w-5" />
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
                            href="/downloads"
                            className="hover:cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Downloads</span>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((current) => !current)}
            >
              {open ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </Button>
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
