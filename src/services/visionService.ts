import api from '@/libs/api';
import { Vision } from '@/types/vision';

const BASE_URL = '/vision';

export async function fetchVisions(): Promise<Vision[]> {
  const res = await api.get(BASE_URL);
  return res.data;
}

export async function createVision(vision: Partial<Vision>): Promise<Vision> {
  const res = await api.post(BASE_URL, vision);
  return res.data;
}

export async function updateVision(id: string, vision: Partial<Vision>): Promise<Vision> {
  const res = await api.patch(`${BASE_URL}/${id}`, vision);
  return res.data;
}

export async function deleteVision(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
