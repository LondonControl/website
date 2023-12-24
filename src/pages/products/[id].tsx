/* eslint-disable import/no-extraneous-dependencies */
import { Disclosure, Tab } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';
import { MoonLoader } from 'react-spinners';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const product = {
  name: 'Zip Tote Basket',
  price: '$140',
  rating: 4,
  images: [
    {
      id: 1,
      name: 'Angled view',
      src: 'https://tailwindui.com/img/ecommerce-images/product-page-03-product-01.jpg',
      alt: 'Angled front view with bag zipped and handles upright.',
    },
    // More images...
  ],
  colors: [
    {
      name: 'Washed Black',
      bgColor: 'bg-gray-700',
      selectedColor: 'ring-gray-700',
    },
    { name: 'White', bgColor: 'bg-white', selectedColor: 'ring-gray-400' },
    {
      name: 'Washed Gray',
      bgColor: 'bg-gray-500',
      selectedColor: 'ring-gray-500',
    },
  ],
  description: `
    <p>The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.</p>
  `,
  details: [
    {
      name: 'Features',
      items: [
        'Multiple strap configurations',
        'Spacious interior with top zip',
        'Leather handle and tabs',
        'Interior dividers',
        'Stainless strap loops',
        'Double stitched construction',
        'Water-resistant',
      ],
    },
    // More sections...
  ],
};

const IndividualProduct: NextPage<Props> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isLoading } = useSWR(`/api/products/${id}`, fetcher);

  // eslint-disable-next-line no-console
  if (error) console.log(error);

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
                  {product.images.map((image) => (
                    <Tab.Panel key={image.id}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-full w-full object-cover object-center tablet:rounded-lg"
                      />
                    </Tab.Panel>
                  ))}
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
                    <button
                      type="submit"
                      className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-gray-50 tablet:w-full"
                    >
                      Add to bag
                    </button>
                  </div>
                </form>

                <section aria-labelledby="details-heading" className="mt-12">
                  <h2 id="details-heading" className="sr-only">
                    Additional details
                  </h2>

                  <div className="divide-y divide-gray-200 border-t">
                    {product.details.map((detail) => (
                      <Disclosure as="div" key={detail.name}>
                        {({ open }) => (
                          <>
                            <h3>
                              <Disclosure.Button className="group relative flex w-full items-center justify-between py-6 text-left">
                                <span
                                  className={classNames(
                                    open ? 'text-gray-900' : 'text-gray-700',
                                    'text-sm font-medium'
                                  )}
                                >
                                  {detail.name}
                                </span>
                                <span className="ml-6 flex items-center">
                                  {open ? (
                                    <MinusIcon
                                      className="block h-6 w-6 text-indigo-400 group-hover:text-indigo-500"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <PlusIcon
                                      className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel
                              as="div"
                              className="prose prose-sm pb-6"
                            >
                              <ul role="list">
                                {detail.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IndividualProduct;
