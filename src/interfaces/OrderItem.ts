export default interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_price: number;
  actual_price: number;
  serial_key_id: string;
  created_at?: string;
  updated_at?: string;
}
