export default interface Announcement {
  id: string;
  title: string;
  text: string;
  url?: string;
  starts_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
