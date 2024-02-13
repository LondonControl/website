import type Order from './Order';
import type Product from './Product';

export default interface OrderItem {
  id: string;
  product_price: number;
  actual_price: number;
  order?: Order;
  product?: Product;
  created_at: string;
  updated_at: string;
}
