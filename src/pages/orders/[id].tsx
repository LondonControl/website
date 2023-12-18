/* eslint-disable import/no-extraneous-dependencies */
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Moment from 'react-moment';
import { MoonLoader } from 'react-spinners';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import type OrderItem from '@/interfaces/OrderItem';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const IndividualOrder: NextPage<Props> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isLoading } = useSWR(`/api/user/orders/${id}`, fetcher);

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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Order # {data?.data.number ?? null}
        </h1>
        <h2 className="sr-only">Order # {data?.data.number ?? null}</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-8 tablet:mt-12 laptop:mx-0 laptop:max-w-none laptop:grid-cols-3">
            {/* Invoice summary */}
            <div className="laptop:col-start-3 laptop:row-end-1">
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">
                      Amount
                    </dt>
                    <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
                      £{data.data.amount / 100}
                    </dd>
                  </div>
                  <div className="flex-none self-end px-6 pt-4">
                    <dt className="sr-only">Status</dt>
                    <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                      Paid
                    </dd>
                  </div>
                  <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                    <dt className="flex-none">
                      <span className="sr-only">Date placed</span>
                      <CalendarDaysIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500">
                      <Moment
                        date={data.data.created_at}
                        format="DD MMMM YYYY hh:mm"
                      />
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-gray-900/5 p-6">
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Download receipt <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
            {/* Invoice */}
            <div className="-mx-4 border border-gray-200 px-4 py-8 tablet:mx-0 tablet:rounded-lg tablet:px-8 tablet:pb-14 laptop:col-span-2 laptop:row-span-2 laptop:row-end-2 desktop:px-16 desktop:pb-20 desktop:pt-16">
              <h2 className="text-lg font-semibold leading-6 text-gray-900">
                London Control
              </h2>
              <p className="mt-2">Invoice</p>
              <p className="mt-2 text-right text-sm">
                No : <span>{data.data.number}</span>
              </p>
              <dl className="mt-2 flex justify-end text-sm leading-6">
                <dt className="inline">Date :</dt>
                <dd className="ml-2 inline text-gray-700">
                  <Moment
                    date={data.data.created_at}
                    format="DD MMMM YYYY hh:mm"
                  />
                </dd>
              </dl>
              <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
                <colgroup>
                  <col className="w-full" />
                  <col />
                </colgroup>
                <thead className="border-b border-gray-200 text-gray-900">
                  <tr>
                    <th scope="col" className="px-0 py-3 font-semibold">
                      Products
                    </th>
                    <th
                      scope="col"
                      className="py-3 pl-8 pr-0 text-right font-semibold"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.items.map((item: OrderItem) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="max-w-0 px-0 py-5 align-top">
                        <div className="truncate font-medium text-gray-900">
                          {item.product?.title}
                        </div>
                        <div className="truncate text-gray-500">
                          {item.product?.description}
                        </div>
                      </td>
                      <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">
                        £{item.actual_price / 100}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      scope="row"
                      className="pt-4 font-semibold text-gray-900 tablet:hidden"
                    >
                      Total
                    </th>
                    <th
                      scope="row"
                      className="hidden pt-4 text-right font-semibold text-gray-900 tablet:table-cell"
                    >
                      Total
                    </th>
                    <td className="align-right pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
                      £{data.data.amount / 100}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndividualOrder;
