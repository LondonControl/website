import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay },
});

const HeroSection: React.FC<Props> = () => {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Subtle dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border) / 0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Radar rings — centred behind the heading */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
        <div className="relative mt-36 flex items-center justify-center tablet:mt-44 laptop:mt-48">
          {[180, 340, 500, 660, 820, 980, 1160].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-foreground/[0.04]"
              style={{ width: size, height: size }}
            />
          ))}
          {/* Crosshair */}
          <div className="absolute h-px w-screen bg-foreground/[0.03]" />
          <div className="absolute h-[1160px] w-px bg-foreground/[0.03]" />
        </div>
      </div>

      {/* Gradient fade — top only so dots run flush into the stats banner */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />

      {/* Centered text block */}
      <div className="relative mx-auto max-w-site px-6 laptop:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-inter text-5xl font-black leading-none text-foreground tablet:text-7xl laptop:text-8xl"
          >
            LONDON
            <br />
            CONTROL
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground tablet:text-lg"
          >
            The most sophisticated ATC simulator of its kind — authentic, highly
            realistic coverage of London, Scottish and Terminal Control
            airspace.
          </motion.p>

          <motion.div
            {...fadeUp(0.2)}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg">
              <Link href="/register">
                Register{' '}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg" className="gap-2">
              {/* TODO: add YouTube URL */}
              <a
                href="https://www.youtube.com/watch?v=yD5nlB4XgAg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PlayCircle className="size-5" />
                Watch demo
              </a>
            </Button>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            {...fadeUp(0.3)}
            className="mx-auto mt-10 flex max-w-sm items-center justify-center divide-x divide-border"
          >
            <div className="px-6 text-center">
              <div className="font-jetbrains text-xl font-bold text-foreground">
                38
              </div>
              <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                AC Sectors
              </div>
            </div>
            <div className="px-6 text-center">
              <div className="font-jetbrains text-xl font-bold text-foreground">
                79
              </div>
              <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                Total Sectors
              </div>
            </div>
            <div className="px-6 text-center">
              <div className="font-jetbrains text-xl font-bold text-foreground">
                21k+
              </div>
              <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                Flight Plans
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero screenshot */}
        <motion.div
          className="relative mx-auto mt-20 tablet:mt-24"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: 'easeOut' as const }}
        >
          <div className="overflow-hidden rounded-xl border border-border shadow-2xl">
            <img
              src="/assets/images/lc_landing.png"
              alt="London Control — radar and airspace interface"
              width={2432}
              height={1442}
              className="w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
