import Link from 'next/link';

interface Props {}

const CTASection: React.FC<Props> = () => {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="relative overflow-hidden rounded-xl bg-primary shadow-2xl">
          {/* Header */}
          <div className="px-6 pt-16 text-center tablet:px-16 laptop:px-24 laptop:pt-20">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground/50">
              Support
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-primary-foreground tablet:text-4xl">
              We&apos;re here to help.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-primary-foreground/60">
              Whether you need a quick answer from the community or direct
              support from our team — we&apos;ve got you covered.
            </p>
          </div>

          {/* Two cards */}
          <div className="mt-10 grid gap-4 px-6 tablet:px-16 laptop:grid-cols-2 laptop:px-24">
            {/* Forum card */}
            <div className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-primary-foreground">
                  Community Forum
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-primary-foreground/60">
                Browse guides, troubleshoot issues, and get answers from
                hundreds of fellow controllers.
              </p>
              <Link
                href="https://forum.londoncontrol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-70"
              >
                Visit forum <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Contact card */}
            <div className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-8">
              <span className="text-sm font-semibold text-primary-foreground">
                Direct Support
              </span>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-primary-foreground/60">
                Need a personal response? Our team is available to answer
                queries, handle licensing questions, and resolve technical
                issues.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-70"
              >
                Contact us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Forum screenshot — full-width at bottom with subtle perspective tilt */}
          <div className="relative mt-12 px-6 tablet:px-16 laptop:px-24">
            <div className="overflow-hidden rounded-t-xl">
              <img
                className="w-full bg-white/5 ring-1 ring-white/10"
                src="/assets/images/lc_forum.png"
                alt="Forum screenshot"
                width={1824}
                height={1080}
                style={{
                  transform: 'perspective(1200px) rotateX(4deg)',
                  transformOrigin: 'bottom center',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
