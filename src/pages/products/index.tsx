/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import MoonLoader from 'react-spinners/MoonLoader';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import ProductCard from '@/components/ProductCard';
import type Product from '@/interfaces/Product';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getProductsEndpoint } from '@/utils/Endpoints';

interface Props {}

const Products: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getProductsEndpoint('?paginate=none'),
    fetcher,
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <MainLayout
      meta={
        <Meta
          title={`Products | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/products`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Products
        </h1>
        <h2 className="sr-only">Products</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-y-4 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-10 laptop:mt-12 laptop:grid-cols-3 laptop:gap-x-8 desktop:grid-cols-4">
            {data?.data.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
