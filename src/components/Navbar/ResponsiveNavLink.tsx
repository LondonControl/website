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
          ? 'border-foreground bg-muted text-foreground focus:border-foreground focus:bg-muted'
          : 'border-transparent text-foreground hover:border-border hover:bg-accent hover:text-foreground focus:border-border focus:bg-accent focus:text-foreground'
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
      className="flex w-full cursor-pointer items-start border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-semibold text-foreground transition duration-150 ease-in-out hover:border-border hover:bg-accent hover:text-foreground focus:border-border focus:bg-accent focus:text-foreground focus:outline-none"
      {...props}
    />
  );
};

export default ResponsiveNavLink;
