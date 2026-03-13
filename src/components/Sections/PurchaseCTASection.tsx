import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {}

const PurchaseCTASection: React.FC<Props> = () => {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="flex flex-col items-center gap-8 text-center tablet:flex-row tablet:justify-between tablet:text-left">
          <div>
            <p className="text-2xl font-black tracking-tight text-primary-foreground tablet:text-3xl">
              Ready to take control?
            </p>
            <p className="mt-2 text-sm text-primary-foreground/60">
              Join thousands of controllers with the most detailed UK ATC
              simulation available.
            </p>
          </div>
          <Button variant="secondary" asChild size="lg" className="shrink-0">
            <Link href="/products">
              Get started{' '}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PurchaseCTASection;
