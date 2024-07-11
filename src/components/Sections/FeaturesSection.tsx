import Features from '@/data/Features';

interface Props {}

const FeaturesSection: React.FC<Props> = () => {
  return (
    <section className="bg-white py-24 tablet:py-32">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="mx-auto max-w-2xl laptop:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-primary tablet:text-4xl">
            All-in-one platform
          </h2>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 tablet:grid-cols-2 laptop:mx-0 laptop:max-w-none laptop:grid-cols-3">
          {Features.map((feature) => (
            <div key={feature.name}>
              <dt className="font-semibold text-card-foreground">
                {feature.name}
              </dt>
              <dd className="mt-1 text-muted-foreground">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default FeaturesSection;
