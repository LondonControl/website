import Link from 'next/link';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const updates = [
  'West Airspace Development in the south-west implemented',
  'Airways and waypoints amended, removed or replaced',
  'Levels and adjacent sector coordination updated',
  'DCT routings expanded',
  'Sector dimensions and coordinates amended',
  'Level bands for some sector blocks amended',
  'SIDs and STARs amended, removed or replaced',
  'Call radii and menu layouts repositioned',
  'Flight plans added, bringing the total available traffic to in excess of 14,000',
  'SRD and RAD compliance checked',
  'Errors (over 4,000 at the first testing cycle!) manually corrected',
  'Route terminators outside London Control airspace re-plotted',
  'Trigraph-to-callsign links reprogrammed (this is an ongoing piece of work)',
];

const LearnMore: React.FC<Props> = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title={`Learn More | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/learn-more`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-16 tablet:px-6 laptop:px-8 laptop:py-24">
        {/* Header */}
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Latest update
        </span>
        <h1 className="mt-4 font-inter text-5xl font-black leading-none tracking-tighter text-foreground tablet:text-6xl laptop:text-7xl">
          London Control,
          <br />
          fully updated.
        </h1>

        <div className="my-8 h-px w-16 bg-border" />

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          We have spent the past six months bringing the simulator up-to-date
          with the latest AIRAC cycle — comprehensive amendments across
          airspace, procedures and traffic.
        </p>

        {/* Update list */}
        <div className="mt-16 max-w-3xl">
          {updates.map((item, i) => (
            <div
              key={item}
              className="flex items-start gap-6 border-t border-border py-6"
            >
              <span className="min-w-[2.5rem] font-jetbrains text-xs font-bold text-muted-foreground/40">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="flex-1 text-sm leading-relaxed text-foreground">
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* Footer notes */}
        <div className="mt-16 grid gap-6 tablet:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Full report
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              See the forum for a more comprehensive breakdown of all changes
              made in this release.
            </p>
            <Link
              href="https://forum.londoncontrol.com"
              target="_blank"
              className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              forum.londoncontrol.com →
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              What&apos;s next
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The sound system is the next major project we are working on.
              Further amendments will be published in conjunction with the AIRAC
              cycle.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              From the team
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Thank you for continuing to support London Control, and thanks to
              Dale McLoughlin for enabling us to continue the excellent work he
              started over twenty years ago.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LearnMore;
