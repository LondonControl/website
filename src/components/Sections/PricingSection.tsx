import { Check } from 'lucide-react';
import Link from 'next/link';

import Pricings from '@/data/Pricings';
import type Pricing from '@/interfaces/Pricing';

import { Button } from '../ui/button';

interface Props {}

const PricingSection: React.FC<Props> = () => {
  return (
    <section className="bg-white py-24 tablet:py-32">
      <div className="mx-auto max-w-7xl px-6 laptop:px-8">
        <div className="mx-auto max-w-4xl tablet:text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 tablet:text-5xl">
            Choose the right option for&nbsp;you
          </h2>
        </div>

        <div className="mt-20 flow-root">
          <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-gray-100 tablet:mx-auto laptop:-mx-8 laptop:mt-0 laptop:max-w-none laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 desktop:-mx-4">
            {Pricings.map((option: Pricing) => (
              <div
                key={option.name}
                className="pt-16 laptop:px-8 laptop:pt-0 desktop:px-14"
              >
                <h3 className="text-base font-semibold leading-7 text-gray-900">
                  {option.name}
                </h3>

                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {option.price}
                  </span>
                </p>

                <Button
                  className="mt-10 w-full"
                  asChild={option.isAvailable}
                  disabled={!option.isAvailable}
                >
                  {option.isAvailable ? (
                    <Link href="/products">Select</Link>
                  ) : (
                    <span>Coming Soon</span>
                  )}
                </Button>

                <p className="mt-10 text-sm font-semibold leading-6 text-gray-900">
                  {option.description}
                </p>

                <ul
                  role="list"
                  className="mt-6 space-y-3 text-sm leading-6 text-gray-600"
                >
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-x-3">
                      <Check className="size-4 flex-none text-black" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
