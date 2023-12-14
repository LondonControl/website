/* eslint-disable import/no-extraneous-dependencies */
import classNames from 'classnames';

import type OrderStatus from '@/interfaces/OrderStatus';

interface Props {
  status: OrderStatus;
}

const getClassNames = (status: string) => {
  let classes;

  switch (status) {
    case 'cancelled':
      classes = 'bg-red-50 text-red-700 ring-red-600/10';
      break;
    case 'completed':
      classes = 'bg-green-50 text-green-700 ring-green-600/20';
      break;
    case 'failed':
      classes = 'bg-red-50 text-red-700 ring-red-600/10';
      break;
    case 'on_hold':
      classes = 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      break;
    case 'pending_payment':
      classes = 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      break;
    case 'processing':
      classes = 'bg-blue-50 text-blue-700 ring-blue-700/10';
      break;
    case 'refunded':
      classes = 'bg-gray-50 text-gray-600 ring-gray-500/10';
      break;
    default:
      break;
  }

  return classes;
};

const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md px-2.5 py-2 text-sm font-medium ring-1 ring-inset',
        getClassNames(status.code)
      )}
    >
      {status.name}
    </span>
  );
};

export default OrderStatusBadge;
