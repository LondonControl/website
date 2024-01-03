/* eslint-disable import/no-extraneous-dependencies */
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X } from 'lucide-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { toast } from 'sonner';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import axios from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const products = [
  {
    id: 1,
    name: 'Basic Tee',
    href: '#',
    price: '$32.00',
    color: 'Sienna',
    inStock: true,
    size: 'Large',
    imageSrc:
      'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in sienna.",
  },
  {
    id: 2,
    name: 'Basic Tee',
    href: '#',
    price: '$32.00',
    color: 'Black',
    inStock: false,
    leadTime: '3–4 weeks',
    size: 'Large',
    imageSrc:
      'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-02.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
  },
  {
    id: 3,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35.00',
    color: 'White',
    inStock: true,
    imageSrc:
      'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-03.jpg',
    imageAlt: 'Insulated bottle with white base and black snap lid.',
  },
];

const Basket: NextPage<Props> = () => {
  const createPaypalOrder = async (items: string[]) => {
    try {
      const itemIds = items.map((item) => ({ id: item }));

      const response = await axios.post('/api/order/create', {
        order_items: itemIds,
      });

      return response.data.data.id;
    } catch (err) {
      toast.error('An error occurred');
      return null;
    }
  };

  const capturePaypalOrder = async (paymentId: any) => {
    try {
      const response = await axios.post('/api/order/capture', {
        transaction_id: paymentId,
      });

      if (response.status === 200) {
        toast.success('Purchase successfull');
      }

      return response;
    } catch (err) {
      toast.error('An error occurred');
      return null;
    }
  };

  return (
    <MainLayout
      meta={
        <Meta
          title={`Checkout | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Checkout
        </h1>

        <form className="mt-12 laptop:grid laptop:grid-cols-12 laptop:items-start laptop:gap-x-12 desktop:gap-x-16">
          <section aria-labelledby="cart-heading" className="laptop:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your basket
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-y border-gray-200"
            >
              {products.map((product) => (
                <li key={product.id} className="flex py-6 tablet:py-10">
                  <div className="shrink-0">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="h-24 w-24 rounded-md object-cover object-center tablet:h-48 tablet:w-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between tablet:ml-6">
                    <div className="relative pr-9 tablet:grid tablet:grid-cols-2 tablet:gap-x-6 tablet:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link
                              href={product.href}
                              className="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {product.name}
                            </Link>
                          </h3>
                        </div>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {product.price}
                        </p>
                      </div>

                      <div className="mt-4 tablet:mt-0 tablet:pr-9">
                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 tablet:p-6 laptop:col-span-5 laptop:mt-0 laptop:p-8"
          >
            <h2
              id="summary-heading"
              className="text-lg font-medium text-gray-900"
            >
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>

                <dd className="text-base font-medium text-gray-900">£112.32</dd>
              </div>
            </dl>

            <div className="mt-8">
              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
                  currency: 'GBP',
                  intent: 'capture',
                }}
              >
                <PayPalButtons
                  style={{
                    color: 'gold',
                    shape: 'rect',
                    label: 'pay',
                    height: 50,
                  }}
                  createOrder={async () => {
                    const orderId = await createPaypalOrder([
                      '9ac9b9e0-75ea-48c5-b7a9-90918ba16e42',
                    ]);

                    return orderId;
                  }}
                  onApprove={async (data) => {
                    await capturePaypalOrder(data.orderID);
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </section>
        </form>
      </div>
    </MainLayout>
  );
};

export default Basket;
