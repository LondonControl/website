export default interface Announcement {
  id: string;
  title: string;
  text: string;
  url?: string;
  starts_at: string;
  expires_at?: string;
}
