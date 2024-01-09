// eslint-disable-next-line import/no-extraneous-dependencies
import Axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axios = Axios.create({
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  baseURL,
});

export const csrf = () => axios.get(`${baseURL}/sanctum/csrf-cookie`);

export const fetcher = (url: string) =>
  axios.get(`${baseURL}${url}`).then((res) => res.data);

export default axios;
