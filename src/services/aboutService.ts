import api from '@/libs/api';
import { About } from '@/types/about';

const BASE_URL = '/about';

export async function fetchAbouts(): Promise<About[]> {
  const res = await api.get(BASE_URL);
  return res.data;
}

export async function createAbout(about: Partial<About>): Promise<About> {
  const res = await api.post(BASE_URL, about);
  return res.data;
}

export async function updateAbout(id: string, about: Partial<About>): Promise<About> {
  const res = await api.patch(`${BASE_URL}/${id}`, about);
  return res.data;
}

export async function deleteAbout(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
