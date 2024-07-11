/* eslint-disable import/no-extraneous-dependencies */
import classNames from 'classnames';
import Link from 'next/link';
import { useState } from 'react';
import Moment from 'react-moment';

import type Order from '@/interfaces/Order';
import type OrderItem from '@/interfaces/OrderItem';

import OrderStatusBadge from './OrderStatusBadge';

interface Props {
  order: Order;
}

const OrderCard: React.FC<Props> = ({ order }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="rounded-md border border-gray-200 bg-card text-card-foreground">
      <h3 className="sr-only">
        Order placed on{' '}
        <Moment date={order.created_at} format="DD/MM/YYYY hh:mm" />
      </h3>

      <div
        className={classNames(
          'flex items-center border-gray-200 p-4 tablet:p-6 hover:cursor-pointer',
          isOpen ? 'border-b' : null,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <dl className="grid flex-1 grid-cols-3 gap-x-6 text-sm laptop:grid-cols-4">
          <div>
            <dt className="font-medium">Order number</dt>
            <dd className="mt-1 text-muted-foreground">{order.number}</dd>
          </div>

          <div className="order-last col-span-full mt-4 laptop:order-none laptop:col-span-1 laptop:mt-0">
            <dt className="font-medium">Date placed</dt>
            <dd className="mt-1 text-muted-foreground">
              <Moment date={order.created_at} format="DD MMMM YYYY HH:mm" />
            </dd>
          </div>

          <div>
            <dt className="font-medium">Total amount</dt>
            <dd className="mt-1 text-muted-foreground">
              £{order.amount / 100}
            </dd>
          </div>

          <div className="justify-self-end">
            {order.status && <OrderStatusBadge status={order.status} />}
          </div>
        </dl>
      </div>

      {/* Products */}
      <h4 className="sr-only">Items</h4>
      <ul role="list" className="divide-y divide-gray-200" hidden={!isOpen}>
        {order.items?.map((item: OrderItem) => (
          <li key={item.id} className="p-4 tablet:p-6">
            <div className="flex items-center">
              <div className="flex-1 text-sm">
                <div className="flex justify-between font-medium text-primary">
                  <div className="flex space-x-4">
                    <Link
                      href={`/products/${item.product?.id}`}
                      className="hover:underline"
                    >
                      {item.product?.title}
                    </Link>

                    <span className="block text-gray-500">|</span>

                    <p>£{item.actual_price / 100}</p>
                  </div>

                  <Link
                    href="/downloads"
                    className="hidden hover:underline laptop:block"
                  >
                    Download
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderCard;
