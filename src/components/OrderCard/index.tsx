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
    <div className="rounded-lg border border-gray-200 bg-white">
      <h3 className="sr-only">
        Order placed on{' '}
        <Moment date={order.created_at} format="DD/MM/YYYY hh:mm" />
      </h3>

      <div
        className={classNames(
          'flex items-center border-gray-200 p-4 tablet:grid tablet:grid-cols-4 tablet:gap-x-6 tablet:p-6 hover:cursor-pointer',
          isOpen ? 'border-b' : null,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm tablet:col-span-3 tablet:grid-cols-3 laptop:col-span-2">
          <div>
            <dt className="font-medium text-gray-900">Order number</dt>
            <dd className="mt-1 text-gray-500">{order.number}</dd>
          </div>

          <div className="hidden tablet:block">
            <dt className="font-medium text-gray-900">Date placed</dt>
            <dd className="mt-1 text-gray-500">
              <Moment date={order.created_at} format="DD MMMM YYYY HH:mm" />
            </dd>
          </div>

          <div>
            <dt className="font-medium text-gray-900">Total amount</dt>
            <dd className="mt-1 font-medium text-gray-900">
              £{order.amount / 100}
            </dd>
          </div>
        </dl>

        <div className="laptop:col-span-2 laptop:flex laptop:items-center laptop:justify-end laptop:space-x-4">
          {order.status && <OrderStatusBadge status={order.status} />}
        </div>
      </div>

      {/* Products */}
      <h4 className="sr-only">Items</h4>
      <ul role="list" className="divide-y divide-gray-200" hidden={!isOpen}>
        {order.items?.map((item: OrderItem) => (
          <li key={item.id} className="p-4 tablet:p-6">
            <div className="flex items-center sm:items-start">
              <div className="flex-1 text-sm">
                <div className="flex justify-between font-medium text-gray-900">
                  <div className="flex space-x-4">
                    <a href={`/products/${item.product?.id}`}>
                      {item.product?.title}
                    </a>
                    <span className="block text-gray-500">|</span>

                    <Link
                      href="/downloads"
                      className="hidden hover:cursor-pointer hover:underline sm:block"
                    >
                      Download
                    </Link>
                  </div>

                  <p>£{item.actual_price / 100}</p>
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
