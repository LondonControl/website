export default interface User {
  id?: string;
  name?: string;
  email?: string;
  email_verified_at?: string;
  must_verify_email?: boolean; // this is custom attribute
  created_at?: string;
  updated_at?: string;
}
