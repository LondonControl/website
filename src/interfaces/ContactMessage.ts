export default interface ContactMessage {
  firstName: string;
  secondName: string;
  email: string;
  subject: string;
  message: string;
  [key: string]: string;
}
