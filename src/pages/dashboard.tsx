import Head from 'next/head';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';

const Dashboard = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title="Laravel Breeze NextJS Typescript"
          description="This is a template project for using Laravel Breeze in NextJS Typescirpt."
        />
      }
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashboard
        </h2>
      }
    >
      <Head>
        <title>Laravel - Dashboard</title>
      </Head>

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">You&apos;re logged in!</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
