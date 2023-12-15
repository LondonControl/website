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
  const {
    data: ordersData,
    error: ordersError,
    isLoading: ordersIsLoading,
  } = useSWR(
    '/api/user/orders?includes=items,status&sorts=created_at&paginate=none',
    fetcher
  );

  const {
    data: productsData,
    error: productsError,
    isLoading: productsIsLoading,
  } = useSWR('/api/products', fetcher);

  if (ordersError) console.log(ordersError);
  if (productsError) console.log(productsError);

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
        <div className="laptop:mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl">
            Order history
          </h1>
        </div>
        <div className="mt-6 tablet:mt-12">
          <h2 className="sr-only">Recent orders</h2>
          <div>
            <div className="mx-auto space-y-6">
              {ordersIsLoading || productsIsLoading ? (
                <div className="flex items-center justify-center">
                  <MoonLoader loading={ordersIsLoading || productsIsLoading} />
                </div>
              ) : (
                ordersData.data.map((order: Order) => (
                  <OrderCard
                    order={order}
                    key={order.id}
                    products={productsData.data ?? null}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Orders;
