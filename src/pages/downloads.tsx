/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import React from 'react';
import { MoonLoader } from 'react-spinners';
import useSWR from 'swr';

import DownloadCard from '@/components/DownloadCard';
import Meta from '@/components/Meta';
import type Product from '@/interfaces/Product';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

const Downloads: NextPage = () => {
  const { data, error, isLoading } = useSWR('/api/user/products', fetcher);

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <MainLayout
      meta={
        <Meta
          title={`Downloads | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Downloads
        </h1>
        <h2 className="sr-only">Downloads</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 tablet:mt-12">
            <div className="mx-auto space-y-6">
              {data?.data.map((product: Product) => (
                <DownloadCard product={product} key={product.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Downloads;
