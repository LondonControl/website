export default interface ErrorInput {
  status: number;
  title: string;
  detail: string;
  source?: {
    pointer: string;
  };
}
