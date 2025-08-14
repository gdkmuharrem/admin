import api from '@/libs/api';
import { Mision } from '@/types/mision';

const BASE_URL = '/mision';

export async function fetchMisions(): Promise<Mision[]> {
  const res = await api.get(BASE_URL);
  return res.data;
}

export async function createMision(mision: Partial<Mision>): Promise<Mision> {
  const res = await api.post(BASE_URL, mision);
  return res.data;
}

export async function updateMision(id: string, mision: Partial<Mision>): Promise<Mision> {
  const res = await api.patch(`${BASE_URL}/${id}`, mision);
  return res.data;
}

export async function deleteMision(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
