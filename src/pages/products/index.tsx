import type { NextPage } from 'next';
import MoonLoader from 'react-spinners/MoonLoader';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import type Product from '@/interfaces/Product';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getProductsEndpoint } from '@/utils/Endpoints';

interface Props {}

const Products: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getProductsEndpoint('?paginate=none&is_available=1'),
    fetcher
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <MainLayout
      meta={
        <Meta
          title={`Products | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Products
        </h1>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-y-4 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-10 laptop:mt-12 laptop:grid-cols-3 laptop:gap-x-8">
            {data.data.map((product: Product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="aspect-h-4 aspect-w-3 bg-gray-200 tablet:aspect-none group-hover:opacity-75 tablet:h-96">
                  <img
                    src="https://images.unsplash.com/photo-1584084807193-bed442df7a75?q=80&w=1824&h=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt={product.title}
                    className="h-full w-full object-cover object-center tablet:h-full tablet:w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col space-y-2 p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    <a href={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500">{product.description}</p>
                  <div className="flex flex-1 flex-col justify-end">
                    <p className="text-base font-medium text-gray-900">
                      £{product.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
