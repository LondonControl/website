export default interface Product {
  id: string;
  title: string;
  description?: string;
  product_type_id: string;
  url?: string;
  price: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}
