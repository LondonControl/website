/* eslint-disable import/no-extraneous-dependencies */
import { Tab } from '@headlessui/react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';
import { MoonLoader } from 'react-spinners';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type Product from '@/interfaces/Product';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const IndividualProduct: NextPage<Props> = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();

  const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

  // eslint-disable-next-line no-console
  if (error) {
    toast.error('Something went wrong, please try again');
  }

  return (
    <MainLayout
      meta={
        <Meta
          title={`Product | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-2xl laptop:mt-12 laptop:max-w-none">
            {/* Product */}
            <div className="laptop:grid laptop:grid-cols-2 laptop:items-start laptop:gap-x-8">
              {/* Image gallery */}
              <Tab.Group as="div" className="flex flex-col-reverse">
                <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
                  <Tab.Panel key={data.data.id}>
                    <img
                      src="https://placehold.co/500x500?text=LC"
                      alt={data.data.title}
                      className="size-full object-cover object-center tablet:rounded-lg"
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              {/* Product info */}
              <div className="mt-10 px-4 tablet:mt-16 tablet:px-0 laptop:mt-0">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {data.data.title}
                </h1>

                <div className="mt-3">
                  <h2 className="sr-only">Product information</h2>
                  <p className="text-3xl tracking-tight text-gray-900">
                    £{data.data.price / 100}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="sr-only">Description</h3>

                  <Markdown className="space-y-6 text-base text-gray-700">
                    {data.data.description}
                  </Markdown>
                </div>

                <form className="mt-6">
                  <div className="mt-10 flex">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => addToCart(data.data as Product)}
                    >
                      Add to basket
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndividualProduct;
