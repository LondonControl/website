// eslint-disable-next-line import/no-extraneous-dependencies
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

import Testimonials from '@/data/Testimonials';
import type Testimonial from '@/interfaces/Testimonial';

interface Props {}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const TestimonialsSection: React.FC<Props> = () => {
  return (
    <section className="bg-background py-24 tablet:py-32">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Testimonials
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground tablet:text-5xl">
              What our community
              <br className="hidden tablet:block" />
              says
            </h2>
          </motion.div>

          <motion.div
            className="mt-16 divide-y divide-border"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {Testimonials.map((testimonial: Testimonial, index: number) => (
              <motion.div
                key={testimonial.name}
                variants={rowVariants}
                className="flex flex-col gap-4 py-8 tablet:grid tablet:grid-cols-[2.5rem_1fr_13rem] tablet:items-start tablet:gap-x-8 tablet:gap-y-0"
              >
                {/* Index */}
                <span className="font-jetbrains text-xs font-bold text-muted-foreground/40 tablet:pt-1">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Quote */}
                <p className="text-base leading-relaxed text-foreground tablet:text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex flex-col gap-0.5 tablet:items-end tablet:text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </span>
                  <div className="mt-2 flex gap-0.5 tablet:justify-end">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-3 fill-foreground text-foreground"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
