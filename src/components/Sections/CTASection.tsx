import Link from 'next/link';

import { Button } from '../ui/button';

interface Props {}

const CTASection: React.FC<Props> = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-site px-6 laptop:px-8">
        <div className="relative overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl tablet:rounded-3xl tablet:px-16 md:pt-24 laptop:flex laptop:gap-x-20 laptop:px-24 laptop:pt-0">
          <div className="mx-auto max-w-md text-center laptop:mx-0 laptop:flex-auto laptop:py-32 laptop:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white tablet:text-4xl">
              In need of some help?
              <br />
              Head over to the{' '}
              <Link
                href="https://forum.londoncontrol.com"
                target="_blank"
                className="underline"
              >
                forum
              </Link>
              .
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-300">
              Have a question that needs direct contact? Use the button below to
              get in touch with us!
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-4 laptop:justify-start">
              <Button variant="secondary" asChild>
                <Link href="https://forum.londoncontrol.com" target="_blank">
                  Get started
                </Link>
              </Button>

              <Button variant="link" asChild>
                <Link href="/contact" className="text-white">
                  Contact us{' '}
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-16 h-80 laptop:mt-8">
            <img
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              // src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
              src="https://images.unsplash.com/photo-1584084807193-bed442df7a75?q=80&w=1824&h=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="App screenshot"
              width={1824}
              height={1080}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
