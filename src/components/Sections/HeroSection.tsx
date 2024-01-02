import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {}

const HeroSection: React.FC<Props> = () => {
  return (
    <section className="tablet:py-30 py-24">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 tablet:text-6xl">
            A most sophisticated ATC simulator
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            London Control is an authentic, highly realistic simulation of the
            actual ATC system over England and Wales.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>

            <Link href="/about">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <img
          src="/assets/images/lc_screenshot.png"
          alt="App screenshot"
          width={2432}
          height={1442}
          className="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 tablet:mt-24"
        />
      </div>
    </section>
  );
};

export default HeroSection;
