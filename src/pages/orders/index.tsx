/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import React from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import PageHeader from '@/components/PageHeader';
import { OrdersColumns, OrdersTable } from '@/components/Tables/OrdersTable';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

const Orders: NextPage = () => {
  const { data, error, isLoading } = useSWR(
    '/api/user/orders?includes=items,status&sorts=created_at&paginate=none',
    fetcher,
  );

  if (error) toast.error('Something went wrong, please try again!');

  return (
    <MainLayout
      meta={
        <Meta
          title={`Orders | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/orders`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <PageHeader eyebrow="Account" title="Order History" />
        <h2 className="sr-only">Order History</h2>

        {isLoading ? (
          <div className="mt-8 space-y-4 tablet:mt-12">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-9 w-48 rounded-md" />
              <Skeleton className="h-9 w-44 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
            {/* Table */}
            <div className="rounded-xl border border-border">
              <div className="overflow-hidden">
                <div className="flex gap-4 border-b border-border px-4 py-3">
                  {[80, 160, 80, 100].map((w, i) => (
                    <Skeleton
                      key={i}
                      className="h-3 rounded"
                      style={{ width: w }}
                    />
                  ))}
                </div>
                {Array.from({ length: 6 }).map((_, row) => (
                  <div
                    key={row}
                    className="flex gap-4 border-b border-border p-4 last:border-0"
                  >
                    {[80, 160, 80, 100].map((w, i) => (
                      <Skeleton
                        key={i}
                        className="h-4 rounded"
                        style={{ width: w + (row % 2 === 0 ? 0 : -20) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-36 rounded-md" />
              <Skeleton className="h-8 w-40 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="mt-8 tablet:mt-12">
            <div className="mx-auto">
              {/* {data.data.map((order: Order) => (
                <OrderCard order={order} key={order.id} />
              ))} */}
              <OrdersTable columns={OrdersColumns} data={data.data} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
