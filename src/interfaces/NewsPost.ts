export default interface NewsPost {
  id: string;
  title: string;
  body: string;
  published_at?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}
