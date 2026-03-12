import type { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

import ApplicationLogo from '@/components/ApplicationLogo';
import { Button } from '@/components/ui/button';

const NotFoundPage: NextPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand (desktop only) */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 laptop:flex laptop:w-5/12">
        {/* Dot-grid pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, hsl(var(--primary-foreground) / 0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Radar rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          {[140, 240, 340, 440, 560, 680].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-primary-foreground/[0.06]"
              style={{ width: size, height: size }}
            />
          ))}
          <div className="absolute h-px w-full bg-primary-foreground/[0.04]" />
          <div className="absolute h-full w-px bg-primary-foreground/[0.04]" />
        </div>

        {/* Gradient fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary" />

        {/* Logo */}
        <div className="relative">
          <Link href="/">
            <ApplicationLogo className="h-7 w-auto opacity-80 brightness-0 invert" />
          </Link>
        </div>

        {/* Brand copy */}
        <div className="relative">
          <h1 className="font-inter text-6xl font-black leading-none text-primary-foreground laptop:text-7xl">
            LONDON
            <br />
            CONTROL
          </h1>
          <p className="mt-6 font-jetbrains text-xs uppercase tracking-[0.3em] text-primary-foreground/30">
            Control the skies.
          </p>
        </div>

        <div />
      </div>

      {/* Right panel — error content */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 tablet:px-10">
          <Link href="/" className="laptop:hidden">
            <ApplicationLogo className="h-6 w-auto" />
          </Link>

          <Link
            href="/"
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to site
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 tablet:px-10">
          <div className="w-full max-w-sm">
            <span className="font-jetbrains text-8xl font-bold leading-none text-foreground/10">
              404
            </span>

            <div className="mt-6">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Error
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                Page not found
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or may have
                been moved.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 tablet:flex-row">
              <Button asChild size="lg" className="flex-1">
                <Link href="/">Go home →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/contact">Contact support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
