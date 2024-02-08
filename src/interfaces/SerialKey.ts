export default interface SerialKey {
  id: string;
  key: string;
  serial_key_type_id: string;
  is_used: boolean;
  is_disabled: boolean;
  created_at?: string;
  updated_at?: string;
}
