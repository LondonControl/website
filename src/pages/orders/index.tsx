/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import React from 'react';
import { MoonLoader } from 'react-spinners';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import OrderCard from '@/components/OrderCard';
import type Order from '@/interfaces/Order';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

const Orders: NextPage = () => {
  const { data, error, isLoading } = useSWR(
    '/api/user/orders?includes=items,status&sorts=created_at&paginate=none',
    fetcher,
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <MainLayout
      meta={
        <Meta
          title={`Orders | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Order History
        </h1>
        <h2 className="sr-only">Order History</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 tablet:mt-12">
            <div className="mx-auto space-y-6">
              {data.data.map((order: Order) => (
                <OrderCard order={order} key={order.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
