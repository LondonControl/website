/* eslint-disable import/no-extraneous-dependencies */
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X } from 'lucide-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import type CartItem from '@/interfaces/CartItem';
import MainLayout from '@/layouts/Main';
import axios, { csrf } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Basket: NextPage<Props> = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const { cartItems, cartTotal, cartDiscountTotal, removeFromCart, clearCart } =
    useCart();
  const [shouldShowPaypal, setShouldShowPaypal] = useState<boolean>(false);
  const router = useRouter();

  if (!user) return null;

  const createPaypalOrder = async (items: string[]) => {
    try {
      const itemIds = items.map((item) => ({ id: item }));

      await csrf();
      const response = await axios.post('/api/order/create', {
        user_id: user?.id,
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
      await csrf();
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
              {cartItems.map((item: CartItem) => (
                <li key={item.product.id} className="flex py-6 tablet:py-10">
                  <div className="shrink-0">
                    <img
                      src="https://placehold.co/200x200?text=LC"
                      alt={item.product.title}
                      className="size-24 rounded-md object-cover object-center tablet:size-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between tablet:ml-6">
                    <div className="relative pr-9 tablet:grid tablet:grid-cols-2 tablet:gap-x-6 tablet:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {item.product.title}
                            </Link>
                          </h3>
                        </div>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          £{item.product.price / 100}
                        </p>
                      </div>

                      <div className="mt-4 tablet:mt-0 tablet:pr-9">
                        <div className="absolute right-0 top-0">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <span className="sr-only">Remove</span>
                            <X className="size-5" aria-hidden="true" />
                          </Button>
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
                <dt className="text-sm text-gray-700">Subtotal</dt>

                <dd className="text-sm text-gray-700">£{cartTotal / 100}</dd>
              </div>

              <div className="flex items-center justify-between border-gray-200">
                <dt className="text-sm text-gray-700">Discount</dt>

                <dd className="text-sm text-gray-700">
                  £{cartDiscountTotal / 100}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>

                <dd className="text-base font-medium text-gray-900">
                  £{(cartTotal - cartDiscountTotal) / 100}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="privacyPolicyAgree"
                  checked={shouldShowPaypal}
                  onCheckedChange={setShouldShowPaypal}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  By selecting this and purchasing you agree to our{' '}
                  <Link
                    href="/terms"
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    terms and conditions
                  </Link>
                  .
                </label>
              </div>
            </div>

            <div className="mt-8" hidden={!shouldShowPaypal}>
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
                    const itemIds = cartItems.map(
                      (item: CartItem) => item.product.id,
                    );
                    const orderId = await createPaypalOrder(itemIds);

                    return orderId;
                  }}
                  onApprove={async (data) => {
                    await capturePaypalOrder(data.orderID);

                    clearCart();
                    router.push('/orders');
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
