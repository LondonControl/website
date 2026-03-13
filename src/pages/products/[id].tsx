/* eslint-disable import/no-extraneous-dependencies */
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { setIsOpen, addToCart, removeFromCart, cartContainsItem } = useCart();

  const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

  if (!isLoading) {
    data.data.images = Object.values(data.data.images);
  }

  if (error) toast.error('Something went wrong, please try again');

  return (
    <MainLayout
      meta={
        <Meta
          title={`${isLoading ? 'Product' : data.data.title} | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        {isLoading ? (
          <div className="laptop:grid laptop:grid-cols-2 laptop:items-start laptop:gap-x-12">
            <div>
              <Skeleton className="aspect-[16/11] w-full rounded-xl" />
              <div className="mt-4 hidden grid-cols-4 gap-3 sm:grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                ))}
              </div>
            </div>
            <div className="mt-10 tablet:mt-16 laptop:mt-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-10 w-3/4" />
              <div className="mt-5 border-b border-border pb-5">
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-10 border-t border-border pt-8">
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <div className="laptop:grid laptop:grid-cols-2 laptop:items-start laptop:gap-x-12">
            {/* Image gallery */}
            <div>
              {data.data.images.length === 0 ? (
                <div className="overflow-hidden rounded-xl border border-border bg-muted">
                  <div className="aspect-h-9 aspect-w-16">
                    <img
                      src="https://placehold.co/800x450?text=LC"
                      alt={data.data.title}
                      className="size-full object-cover object-center"
                    />
                  </div>
                </div>
              ) : (
                <Tab.Group as="div" className="flex flex-col-reverse gap-4">
                  {/* Thumbnail strip */}
                  <div className="hidden w-full sm:block">
                    <Tab.List className="grid grid-cols-4 gap-3">
                      {data.data.images.map((image: Media) => (
                        <Tab
                          key={image.uuid}
                          className="relative overflow-hidden rounded-lg border border-border bg-card focus:outline-none"
                        >
                          {({ selected }) => (
                            <>
                              <span className="sr-only">{image.name}</span>
                              <div className="aspect-[4/3]">
                                <img
                                  src={image.preview_url}
                                  alt={image.file_name}
                                  className="size-full object-cover object-center transition-opacity duration-150"
                                />
                              </div>
                              <span
                                className={classNames(
                                  selected
                                    ? 'ring-foreground'
                                    : 'ring-transparent',
                                  'pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset',
                                )}
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>

                  {/* Main image */}
                  <Tab.Panels className="overflow-hidden rounded-xl border border-border">
                    {data.data.images.map((image: Media) => (
                      <Tab.Panel key={image.uuid}>
                        <div className="aspect-h-11 aspect-w-16">
                          <img
                            src={image.original_url}
                            alt={image.name}
                            className="size-full object-cover object-center"
                          />
                        </div>
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>

            {/* Product info */}
            <div className="mt-10 tablet:mt-16 laptop:mt-0">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                London Control
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground tablet:text-4xl">
                {data.data.title}
              </h1>

              <div className="mt-5 border-b border-border pb-5">
                <p className="font-jetbrains text-4xl font-bold text-foreground">
                  £{data.data.price / 100}
                </p>
              </div>

              <div className="mt-6">
                <Markdown className="space-y-4 text-base leading-relaxed text-muted-foreground">
                  {data.data.description}
                </Markdown>
              </div>

              <div className="mt-10 border-t border-border pt-8">
                {cartContainsItem(data.data.id) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      removeFromCart(data.data.id);
                      setIsOpen(true);
                    }}
                  >
                    Remove from basket
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      addToCart(data.data as Product);
                      setIsOpen(true);
                    }}
                  >
                    Add to basket →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndividualProduct;
