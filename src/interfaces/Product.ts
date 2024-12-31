import type Media from './Media';
import type ProductType from './ProductType';

export default interface Product {
  id: string;
  title: string;
  description?: string;
  url: string;
  price: number;
  is_available: boolean;
  needs_activating: boolean;
  current_airac: string;
  type?: ProductType;
  images?: Media[];
}
