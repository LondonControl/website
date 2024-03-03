import type DocumentType from './DocumentType';

export default interface Document {
  id: string;
  title: string;
  description?: string;
  url: string;
  is_available: boolean;
  type?: DocumentType;
  created_at: string;
  updated_at: string;
}
