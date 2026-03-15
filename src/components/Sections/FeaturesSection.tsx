// eslint-disable-next-line import/no-extraneous-dependencies
import { motion } from 'framer-motion';

import Features from '@/data/Features';

interface Props {}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const FeaturesSection: React.FC<Props> = () => {
  return (
    <section className="bg-background py-24 tablet:py-32">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Built for realism
          </span>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground tablet:text-5xl">
            Everything you need
            <br />
            to work the skies.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every feature is designed around how real ATC works — not a
            simplified approximation of it.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.dl
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-0 tablet:grid-cols-2 laptop:mx-0 laptop:max-w-none laptop:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {Features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                variants={cardVariants}
                className="border-t border-border py-8"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
                  <Icon className="size-4 text-foreground" strokeWidth={1.5} />
                </div>
                <dt className="text-base font-black tracking-tight text-foreground">
                  {feature.name}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </dd>
              </motion.div>
            );
          })}
        </motion.dl>
      </div>
    </section>
  );
};

export default FeaturesSection;
