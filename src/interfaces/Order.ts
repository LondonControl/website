import type Discount from './Discount';
import type OrderItem from './OrderItem';
import type OrderStatus from './OrderStatus';
import type User from './User';

export default interface Order {
  id: string;
  number: string;
  amount: number;
  transaction_id?: string;
  status?: OrderStatus;
  user?: User;
  items?: OrderItem[];
  discount?: Discount;
  created_at: string;
  updated_at: string;
}
