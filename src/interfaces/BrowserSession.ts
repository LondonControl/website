export default interface BrowserSession {
  id: string;
  agent: string;
  ip_address: string;
  is_current_device: boolean;
  last_active: string;
}
