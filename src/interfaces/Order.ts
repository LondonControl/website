import type Discount from './Discount';
import type OrderItem from './OrderItem';
import type OrderStatus from './OrderStatus';

export default interface Order {
  id: string;
  number?: string;
  user_id: string;
  order_status_id: string;
  amount: number;
  discount_id: string;
  transaction_id?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  status?: OrderStatus;
  discount?: Discount;
}
