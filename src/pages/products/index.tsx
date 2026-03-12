/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type Product from '@/interfaces/Product';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getProductsEndpoint } from '@/utils/Endpoints';

interface Props {}

const Products: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getProductsEndpoint('?paginate=none&sorts=-price&is_available=1'),
    fetcher,
  );

  if (error) toast.error('Something went wrong, please try again!');

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
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <PageHeader eyebrow="Store" title="Products" />
        <h2 className="sr-only">Products</h2>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:mt-12 laptop:grid-cols-3 laptop:gap-6 desktop:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="flex grow flex-col p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-4 w-3/4" />
                  <Skeleton className="mt-3 h-6 w-16" />
                  <Skeleton className="mt-5 h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:mt-12 laptop:grid-cols-3 laptop:gap-6 desktop:grid-cols-4">
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
