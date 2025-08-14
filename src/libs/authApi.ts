import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error('API base URL not defined in .env.local');
}

const api = axios.create({
  baseURL,
  withCredentials: true, // çünkü cookie kullanıyoruz
});

export default api;
