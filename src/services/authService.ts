import api from '@/libs/authApi';
import { LoginData } from '@/types/auth';
import { AxiosError } from 'axios';

export async function login(data: LoginData) {
  const response = await api.post('/login', data);
  return response.data;
}

export async function logout() {
  await api.post('/logout');
}

export async function getCurrentAdmin() {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (err: unknown) {
    // AxiosError mi kontrol edelim
    if (err instanceof AxiosError) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        return null;
      }
    }
    throw err; // diğer hatalar için throw et
  }
}
