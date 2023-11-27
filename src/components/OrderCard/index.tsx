/* eslint-disable import/no-extraneous-dependencies */
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { Fragment, useState } from 'react';
import Moment from 'react-moment';

import type Order from '@/interfaces/Order';
import type OrderItem from '@/interfaces/OrderItem';
import type Product from '@/interfaces/Product';

import OrderStatusBadge from './OrderStatusBadge';

interface Props {
  order: Order;
  products?: Product[];
}

const OrderCard: React.FC<Props> = ({ order, products }) => {
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
          isOpen ? 'border-b' : null
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
              <Moment date={order.created_at} format="DD MMMM YYYY hh:mm" />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Total amount</dt>
            <dd className="mt-1 font-medium text-gray-900">
              £{order.amount / 100}
            </dd>
          </div>
        </dl>

        <Menu as="div" className="relative flex justify-end laptop:hidden">
          <div className="flex items-center">
            <Menu.Button className="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Options for order {order.number}</span>
              <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href={order.id}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      View
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        <div className="hidden laptop:col-span-2 laptop:flex laptop:items-center laptop:justify-end laptop:space-x-4">
          {order.status && <OrderStatusBadge status={order.status} />}
          <a
            href={order.id}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span>View Order</span>
            <span className="sr-only">{order.number}</span>
          </a>
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
                  <a href={`/products/${item.product_id}`}>
                    {products?.find(
                      (product: Product) => product.id === item.product_id
                    )?.title ?? null}
                  </a>
                  <p>£{item.actual_price / 100}</p>
                </div>
                <p className="hidden text-gray-500 tablet:mt-2 tablet:block">
                  {/* {product.description} */}
                  {products?.find(
                    (product: Product) => product.id === item.product_id
                  )?.description ?? null}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderCard;
