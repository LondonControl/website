import Link from 'next/link';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

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
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Learn More
        </h1>
        <h2 className="sr-only">Learn More</h2>

        <div className="mt-6 tablet:mt-12">
          <div className="mx-auto space-y-6">
            <h2>
              London Control, fully updated to the latest AIRAC, is now
              available!
            </h2>

            <p>
              We have spent the past six months bringing the simulator
              up-to-date with the following:
            </p>

            <ul className="ml-4 list-disc">
              <li>West Airspace Development in the south-west implemented</li>
              <li>Airways and waypoints amended, removed or replaced</li>
              <li>Levels and adjacent sector coordination updated</li>
              <li>DCT routings expanded</li>
              <li>Sector dimensions and coordinates amended</li>
              <li>Level bands for some sector blocks amended</li>
              <li>SIDs and STARs amended, removed or replaced</li>
              <li>Call radii and menu layouts repositioned</li>
              <li>
                Flight plans added, bringing the total available traffic to in
                excess of 14,000
              </li>
              <li>SRD and RAD compliance checked</li>
              <li>
                Errors (over 4,000 at the first testing cycle!) manually
                corrected
              </li>
              <li>
                Route terminators outside London Control airspace re-plotted
              </li>
              <li>
                Trigraph-to-callsign links reprogrammed (this is an ongoing
                piece of work)
              </li>
            </ul>

            <p>
              See the forum{' '}
              <Link
                href="https://forum.londoncontrol.com"
                target="_blank"
                className="font-medium hover:underline"
              >
                (https://forum.londoncontrol.com)
              </Link>{' '}
              for a more comprehensive report.
            </p>

            <p>
              The sound system is the next major project that we are working on
              and further amendments to London Control will be published in
              conjunction with the AIRAC cycle.
            </p>

            <p>
              We are a team of three who each has full-time vocational
              commitments aside from London Control. Whilst we strive to answer
              emails and forum posts when they are received, there may sometimes
              be a delay if we are engaged with other things. We respond to all
              correspondence (where we consider it is required) and appreciate
              your patience if occasionally there is a delay between receipt and
              reply.
            </p>

            <p>
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
