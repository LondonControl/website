import CountUp from 'react-countup';

interface Props {}

const MainStatsSection: React.FC<Props> = () => {
  return (
    <section className="bg-primary py-24 tablet:py-32" id="stats">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center laptop:grid-cols-4">
          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">
              Area Control Sectors
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-white tablet:text-5xl">
              <CountUp end={38} enableScrollSpy />
            </dd>
          </div>

          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">
              Terminal Control Sectors
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-white tablet:text-5xl">
              <CountUp end={16} enableScrollSpy />
            </dd>
          </div>

          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">
              Airport and Approach Control Sectors
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-white tablet:text-5xl">
              <CountUp end={25} enableScrollSpy />
            </dd>
          </div>

          <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <dt className="text-base leading-7 text-gray-400">Flight plans</dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-white tablet:text-5xl">
              <CountUp end={21000} suffix="+" enableScrollSpy />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default MainStatsSection;
