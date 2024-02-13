export default interface Media {
  uuid: string;
  mame: string;
  file_name: string;
  preview_url?: string;
  original_url: string;
  order: number;
  custom_properties: [];
  extension: string;
  size: number;
}
