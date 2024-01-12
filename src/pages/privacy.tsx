import type { NextPage } from 'next';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Privacy: NextPage<Props> = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title={`Privacy | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl">
          Privacy
        </h1>

        <div className="mx-auto mt-6 laptop:mt-12"></div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
