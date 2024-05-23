/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X } from 'lucide-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import type CartItem from '@/interfaces/CartItem';
import MainLayout from '@/layouts/Main';
import axios, { csrf } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const formSchema = z.object({
  code: z.string(),
});

const Basket: NextPage<Props> = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const {
    cartItems,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    cartContainsDiscount,
    cartDiscountTotal,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
  } = useCart();
  const [shouldShowPaypal, setShouldShowPaypal] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  if (!user) return null;

  const createPaypalOrder = async (items: string[], discountId: any) => {
    try {
      const itemIds = items.map((item) => ({ id: item }));

      await csrf();
      const response = await axios.post('/api/order/create', {
        user_id: user?.id,
        discount_id: discountId ?? null,
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
      if (paymentId == null) throw new Error('Payment id is null');

      await csrf();
      const response = await axios.post('/api/order/capture', {
        transaction_id: paymentId,
      });

      if (response.status === 200) {
        toast.success('Purchase successfull');
      }

      form.reset();
      removeDiscount(cartDiscount?.discount.id ?? '');

      return response;
    } catch (err) {
      toast.error('An error occurred');
      return null;
    }
  };

  const createDemoOrder = async (items: string[], discountId: any) => {
    try {
      const itemIds = items.map((item) => ({ id: item }));

      await csrf();
      const response = await axios.post('/api/order-demo/create', {
        user_id: user?.id,
        discount_id: discountId ?? null,
        order_items: itemIds,
      });

      if (response.status === 200) {
        toast.success('Purchase successfull');
      }

      form.reset();
      removeDiscount(cartDiscount?.discount.id ?? '');

      return response;
    } catch (err) {
      toast.error('An error occurred');
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.get(
        `/api/discounts/verify?code=${values.code}`,
      );

      if (cartContainsDiscount(response.data.data.id)) {
        form.reset();
        toast.error('The discount code has already been applied!');
        return;
      }

      applyDiscount(response.data.data);

      form.reset();
      toast.success('The discount has been applied successfully!');
    } catch (error: any) {
      if (error.response.status === 404) {
        toast.error(error.response.data.errors[0].detail);
        return;
      }

      if (error.response.status === 422) {
        toast.error(error.response.data.errors[0].detail);
        return;
      }

      toast.error('Something went wrong, please try again!');
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

        <div className="mt-12 laptop:grid laptop:grid-cols-12 laptop:items-start laptop:gap-x-12 desktop:gap-x-16">
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
                      src={
                        Object.keys(item.product.images || []).length === 0
                          ? `https://placehold.co/200x200?text=LC`
                          : Object.values(item.product.images || [])[0]
                              ?.original_url
                      }
                      alt={item.product.title}
                      className="size-24 rounded-md object-cover object-center tablet:size-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between tablet:ml-6">
                    <div className="relative pr-9">
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

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          £{item.product.price / 100}
                        </p>

                        <p className="mt-2 hidden text-sm tablet:block">
                          {item.product.description}
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
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex items-end space-x-2"
                  >
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Code</FormLabel>

                          <FormControl>
                            <Input placeholder="Discount Code" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Apply</Button>
                  </form>
                </Form>
              </div>

              {cartDiscount && (
                <span className="inline-flex items-center gap-x-1 rounded-md bg-input px-2 py-1 text-xs font-medium text-gray-800">
                  {cartDiscount.discount.code}
                  <button
                    onClick={() => removeDiscount(cartDiscount.discount.id)}
                    type="button"
                    className="group relative -mr-1 size-3.5 rounded-sm hover:bg-gray-600/20"
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      viewBox="0 0 14 14"
                      className="size-3.5 stroke-gray-800/75 group-hover:stroke-gray-800"
                    >
                      <path d="M4 4l6 6m0-6l-6 6" />
                    </svg>
                    <span className="absolute -inset-1" />
                  </button>
                </span>
              )}

              <div className="flex items-center justify-between border-gray-200 pt-2">
                <dt className="text-sm text-gray-700">Subtotal</dt>

                <dd className="text-sm text-gray-700">£{cartSubtotal / 100}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-700">Discount</dt>

                <dd className="text-sm text-gray-700">
                  -£{(cartDiscountTotal / 100).toFixed(2)}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>

                <dd className="text-base font-medium text-gray-900">
                  £{(cartTotal / 100).toFixed(2)}
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
              {cartTotal === 0 ? (
                <Button
                  className="w-full"
                  onClick={async () => {
                    const itemIds = await cartItems.map(
                      (item: CartItem) => item.product.id,
                    );

                    await createDemoOrder(itemIds, cartDiscount?.discount.id);

                    clearCart();
                    router.push('/orders');
                  }}
                >
                  Order now
                </Button>
              ) : (
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
                    currency: 'GBP',
                    intent: 'capture',
                  }}
                >
                  <PayPalButtons
                    forceReRender={[cartItems, cartDiscount]}
                    style={{
                      color: 'gold',
                      shape: 'rect',
                      label: 'pay',
                      height: 50,
                    }}
                    createOrder={async () => {
                      const itemIds = await cartItems.map(
                        (item: CartItem) => item.product.id,
                      );

                      const orderId = await createPaypalOrder(
                        itemIds,
                        cartDiscount?.discount.id,
                      );

                      return orderId;
                    }}
                    onApprove={async (data) => {
                      if (data.orderID == null) return;

                      await capturePaypalOrder(data.orderID);

                      clearCart();
                      router.push('/orders');
                    }}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Basket;
