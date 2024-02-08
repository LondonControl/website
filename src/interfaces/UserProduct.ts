import type Product from './Product';
import type SerialKey from './SerialKey';

export default interface UserProduct {
  id: string;
  product_id: string;
  serial_key_id: string;
  user_id: string;
  is_available: boolean;
  product?: Product;
  serial_key?: SerialKey;
  created_at?: string;
  updated_at?: string;
}
