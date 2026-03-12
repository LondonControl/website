import Link from 'next/link';
import React from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';

interface Props {}

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/LondonControl24',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCq8JZ1mzkRG5aSblL8Y_qag',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const navigation = {
  product: [
    { name: 'Products', href: '/products' },
    { name: 'Documents', href: '/documents' },
    { name: 'Utilities', href: '/utilities' },
    { name: 'Downloads', href: '/downloads' },
  ],
  support: [
    { name: 'Forum', href: 'https://forum.londoncontrol.com', external: true },
    { name: 'Contact', href: '/contact' },
    { name: 'News', href: '/news' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
};

const Footer: React.FC<Props> = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-site px-6 py-16 laptop:px-8">
        <div className="grid grid-cols-1 gap-12 laptop:grid-cols-4">
          {/* Brand column */}
          <div className="laptop:col-span-1">
            <Link href="/">
              <ApplicationLogo className="block h-6 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The most sophisticated ATC simulator of its kind.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="size-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 laptop:col-span-3 laptop:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Product
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Support
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      target={(item as any).external ? '_blank' : undefined}
                      rel={
                        (item as any).external
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="text-xs text-muted-foreground">London Control.</p>
          <p className="text-xs text-muted-foreground">
            Website by{' '}
            <Link
              href="https://geren.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground hover:underline"
            >
              Gerenuk
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
