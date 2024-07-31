import type Product from './Product';
import type SerialKey from './SerialKey';
import type User from './User';

export default interface UserProduct {
  id: string;
  user?: User;
  product?: Product;
  serial_key?: SerialKey;
}
