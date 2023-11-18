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
    <div
      className="rounded-lg border border-gray-200 bg-white hover:cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <h3 className="sr-only">
        Order placed on{' '}
        <Moment date={order.created_at} format="DD/MM/YYYY hh:mm" />
      </h3>

      <div
        className={classNames(
          'flex items-center border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6',
          isOpen ? 'border-b' : null
        )}
      >
        <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
          <div>
            <dt className="font-medium text-gray-900">Order number</dt>
            <dd className="mt-1 text-gray-500">{order.id}</dd>
          </div>
          <div className="hidden sm:block">
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

        <Menu as="div" className="relative flex justify-end lg:hidden">
          <div className="flex items-center">
            <Menu.Button className="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Options for order {order.id}</span>
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

        <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
          {order.status && <OrderStatusBadge status={order.status} />}
          <a
            href={order.id}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span>View Order</span>
            <span className="sr-only">{order.id}</span>
          </a>
        </div>
      </div>

      {/* Products */}
      <h4 className="sr-only">Items</h4>
      <ul role="list" className="divide-y divide-gray-200" hidden={!isOpen}>
        {order.items?.map((item: OrderItem) => (
          <li key={item.id} className="p-4 sm:p-6">
            <div className="flex items-center sm:items-start">
              <div className="flex-1 text-sm">
                <div className="font-medium text-gray-900 sm:flex sm:justify-between">
                  <h5>
                    {products?.find(
                      (product: Product) => product.id === item.product_id
                    )?.title ?? null}
                  </h5>
                  <p className="mt-2 sm:mt-0">£{item.actual_price / 100}</p>
                </div>
                <p className="hidden text-gray-500 sm:mt-2 sm:block">
                  {/* {product.description} */}
                  {products?.find(
                    (product: Product) => product.id === item.product_id
                  )?.description ?? null}
                </p>
              </div>
            </div>

            <div className="mt-6 sm:flex sm:justify-end">
              <div className="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
                <div className="flex flex-1 justify-center">
                  <a
                    href={`/products/${item.product_id}`}
                    className="whitespace-nowrap text-indigo-600 hover:text-indigo-500"
                  >
                    View product
                  </a>
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
