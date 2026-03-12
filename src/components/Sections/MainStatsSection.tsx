import CountUp from 'react-countup';

interface Props {}

const stats = [
  { end: 38, suffix: '', label: 'Area Control\nSectors' },
  { end: 16, suffix: '', label: 'Terminal Control\nSectors' },
  { end: 25, suffix: '', label: 'Approach Control\nSectors' },
  { end: 21000, suffix: '+', label: 'Flight\nPlans' },
];

const MainStatsSection: React.FC<Props> = () => {
  return (
    <section className="border-y border-border bg-primary py-12" id="stats">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <dl className="grid grid-cols-2 laptop:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`border-primary-foreground/10 px-6 py-14 text-center tablet:px-10
                ${i % 2 === 0 ? 'border-r' : ''}
                ${i >= 2 ? 'border-t' : ''}
                ${i % 2 === 0 ? 'laptop:border-r-0' : ''}
                ${i >= 2 ? 'laptop:border-t-0' : ''}
                ${i > 0 ? 'laptop:border-l' : ''}
              `}
            >
              <dd className="font-jetbrains text-5xl font-bold text-primary-foreground tablet:text-6xl">
                <CountUp end={stat.end} suffix={stat.suffix} enableScrollSpy />
              </dd>
              <dt className="mt-3 whitespace-pre-line text-xs uppercase tracking-[0.15em] text-primary-foreground/50">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default MainStatsSection;
