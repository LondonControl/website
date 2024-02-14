/* eslint-disable import/no-extraneous-dependencies */
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';
import { MoonLoader } from 'react-spinners';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type Media from '@/interfaces/Media';
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

  // console.log(Object.fromEntries(data.images));

  if (!isLoading) {
    data.data.images = Object.values(data.data.images);
  }

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
              {data.data.images.length === 0 ? (
                <Tab.Group as="div" className="flex flex-col-reverse">
                  <Tab.Panels className="aspect-h-9 aspect-w-16">
                    <Tab.Panel key={data.data.id}>
                      <img
                        src="https://placehold.co/500x500?text=LC"
                        alt={data.data.title}
                        className="size-full object-cover object-center tablet:rounded-lg"
                      />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              ) : (
                <Tab.Group as="div" className="flex flex-col-reverse">
                  {/* Image selector */}
                  <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                    <Tab.List className="grid grid-cols-4 gap-6">
                      {data.data.images.map((image: Media) => (
                        <Tab
                          key={image.uuid}
                          // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
                          className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                        >
                          {({ selected }) => (
                            <>
                              <span className="sr-only">{image.name}</span>
                              <span className="absolute inset-0 overflow-hidden rounded-md">
                                <img
                                  src={image.preview_url}
                                  alt={image.file_name}
                                  className="size-full object-cover object-center"
                                />
                              </span>
                              <span
                                className={classNames(
                                  selected
                                    ? 'ring-slate-800'
                                    : 'ring-transparent',
                                  'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2',
                                )}
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>

                  <Tab.Panels className="aspect-h-11 aspect-w-16">
                    {data.data.images.map((image: Media) => (
                      <Tab.Panel key={image.uuid}>
                        <img
                          src={image.original_url}
                          alt={image.name}
                          className="size-full object-cover object-center sm:rounded-lg"
                        />
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              )}

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
