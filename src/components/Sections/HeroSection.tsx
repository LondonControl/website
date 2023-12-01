import PrimaryLinkButton from '../Buttons/PrimaryLinkButton';

interface Props {}

const HeroSection: React.FC<Props> = () => {
  return (
    <section className="tablet:py-30 py-24">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black tablet:text-6xl">
            The most sophisticated ATC simulator
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            London Control is an authentic, highly realistic simulation of the
            actual ATC system over England and Wales.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <PrimaryLinkButton href="/register">Get started</PrimaryLinkButton>
            {/* <a
              href="#"
              className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Get started
            </a> */}
            <a href="#" className="text-sm font-semibold leading-6">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <img
          // src="https://images.unsplash.com/photo-1584084807193-bed442df7a75?q=80&w=2432&h=1442&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          src="/assets/images/lc_screenshot.png"
          alt="App screenshot"
          width={2432}
          height={1442}
          className="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 tablet:mt-24"
        />
      </div>
    </section>
  );
};

export default HeroSection;
