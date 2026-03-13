/* eslint-disable import/no-extraneous-dependencies */
import {
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  LogOut,
  Mail,
  MenuIcon,
  MessageSquare,
  Package,
  ShoppingCart,
  UserCog,
  UserIcon,
  Wrench,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';
import NavLink from '@/components/Navbar/NavLink';
import ShoppingBasketDrawer from '@/components/ShoppingBasketDrawer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { cartItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-background transition-all duration-200 ${
        scrolled ? 'border-b border-border backdrop-blur-md' : ''
      }`}
    >
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Account menu"
                      >
                        <UserIcon className="size-5" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-64 rounded-xl shadow-lg"
                      align="end"
                    >
                      <div className="flex items-center gap-3 p-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {user?.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {user?.email}
                          </div>
                        </div>
                      </div>

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
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <LogOut className="mr-2 size-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">
                      Register{' '}
                      <span aria-hidden="true" className="ml-1">
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
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((current) => !current)}
            >
              {open ? (
                <XIcon className="size-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="size-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Responsive Navigation Menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-300 ease-in-out laptop:hidden ${
          open ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border">
          {/* Nav Links */}
          <nav aria-label="Mobile navigation">
            <div className="py-2">
              {(
                [
                  {
                    href: '/products',
                    label: 'Products',
                    icon: Package,
                    external: false,
                  },
                  {
                    href: '/documents',
                    label: 'Documents',
                    icon: FileText,
                    external: false,
                  },
                  {
                    href: '/utilities',
                    label: 'Utilities',
                    icon: Wrench,
                    external: false,
                  },
                  {
                    href: 'https://forum.londoncontrol.com',
                    label: 'Forum',
                    icon: MessageSquare,
                    external: true,
                  },
                  {
                    href: '/contact',
                    label: 'Contact',
                    icon: Mail,
                    external: false,
                  },
                ] as const
              ).map(({ href, label, icon: Icon, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  aria-current={router.pathname === href ? 'page' : undefined}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    router.pathname === href
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                  <ChevronRight
                    className="ml-auto size-4 opacity-30"
                    aria-hidden="true"
                  />
                </Link>
              ))}

              {user && (
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  aria-current={
                    router.pathname === '/checkout' ? 'page' : undefined
                  }
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    router.pathname === '/checkout'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <ShoppingCart
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  Basket
                  {cartItems.length > 0 && (
                    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      <span className="sr-only">items in basket: </span>
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-border">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-5 py-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {user?.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border py-2">
                  {(
                    [
                      { href: '/orders', label: 'Orders', icon: ClipboardList },
                      {
                        href: '/downloads',
                        label: 'Downloads',
                        icon: Download,
                      },
                      { href: '/profile', label: 'Profile', icon: UserCog },
                    ] as const
                  ).map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={
                        router.pathname === href ? 'page' : undefined
                      }
                      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                        router.pathname === href
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="size-4 shrink-0" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 p-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                >
                  Get started <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
