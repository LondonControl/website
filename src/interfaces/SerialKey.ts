import type SerialKeyType from './SerialKeyType';

export default interface SerialKey {
  id: string;
  key: string;
  type?: SerialKeyType;
  created_at: string;
  updated_at: string;
}
