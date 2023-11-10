import type { NextPage } from 'next';

import PrimaryButton from '@/components/Buttons/PrimaryButton';
import Meta from '@/components/Meta';
import MainStatsSection from '@/components/Sections/MainStatsSection';
import GuestLayout from '@/layouts/Guest';

interface Props {}

const Index: NextPage<Props> = () => {
  return (
    <GuestLayout
      meta={
        <Meta
          title="Laravel Breeze NextJS Typescript"
          description="This is a template project for using Laravel Breeze in NextJS Typescirpt."
        />
      }
    >
      <div className="mx-auto max-w-site px-6 desktop:px-16">
        <h1 className="mt-10 text-center text-5xl font-semibold">
          No gimmicks, just realistic ATC
        </h1>

        <PrimaryButton className="mt-12">Sign up now</PrimaryButton>

        <div className="mt-8 h-80 w-full rounded-md bg-gray-500">f</div>
      </div>

      <div className="mt-8 max-w-site">
        <MainStatsSection />
      </div>
    </GuestLayout>
  );
};

export default Index;
