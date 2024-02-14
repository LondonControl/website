export default interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at?: string;
  must_verify_email?: boolean;
  created_at: string;
  updated_at: string;
}
