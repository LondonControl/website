// eslint-disable-next-line import/no-extraneous-dependencies
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

import Pricings from '@/data/Pricings';
import type Pricing from '@/interfaces/Pricing';

import { Button } from '../ui/button';

interface Props {}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const PricingSection: React.FC<Props> = () => {
  return (
    <section className="bg-background py-24 tablet:py-32" id="pricing">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <motion.div
          className="m-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground tablet:text-5xl">
            Choose from the following options
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Get up and running with London Control — everything you need in one
            package.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 grid grid-cols-1 gap-4 laptop:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {Pricings.map((option: Pricing, index: number) => {
            const isFeatured = index === 0;
            return (
              <motion.div
                key={option.name}
                variants={cardVariants}
                className="relative pt-4"
              >
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-8 ${
                    isFeatured
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card'
                  }`}
                >
                  {isFeatured && (
                    <span className="absolute left-8 top-0 inline-flex -translate-y-1/2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground shadow-sm">
                      Most popular
                    </span>
                  )}
                  <h3
                    className={`text-xs font-medium uppercase tracking-widest ${
                      isFeatured
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {option.name}
                  </h3>

                  <p className="mt-4 font-jetbrains text-5xl font-bold tracking-tight">
                    {option.price}
                  </p>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isFeatured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {option.description}
                  </p>

                  <div
                    className={`my-6 h-px w-full ${
                      isFeatured ? 'bg-primary-foreground/10' : 'bg-border'
                    }`}
                  />

                  <ul className="space-y-3 text-sm">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`mt-0.5 size-4 flex-none ${
                            isFeatured
                              ? 'text-primary-foreground'
                              : 'text-foreground'
                          }`}
                        />
                        <span
                          className={
                            isFeatured
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <Button
                      className="w-full"
                      asChild={option.isAvailable}
                      disabled={!option.isAvailable}
                      variant={isFeatured ? 'secondary' : 'default'}
                    >
                      {option.isAvailable ? (
                        <Link href="/products">Select package</Link>
                      ) : (
                        <span>Unavailable</span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
