export default interface Discount {
  id: string;
  title: string;
  description?: string;
  code: string;
  quantity?: number;
  amount: number;
  is_percentage: boolean;
  is_used: boolean;
  starts_at: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}
