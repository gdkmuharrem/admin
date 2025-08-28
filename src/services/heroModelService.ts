import api from '@/libs/api';
import { HeroModel } from '@/types/heroModel';

const BASE_URL = '/hero-model';

export async function getModelsByHero(heroId: string): Promise<HeroModel[]> {
  const res = await api.get(`${BASE_URL}/${heroId}`);
  return res.data;
}

export async function uploadModel(heroId: string, file: File): Promise<HeroModel> {
  const formData = new FormData();
  formData.append('model', file);

  const res = await api.post(`${BASE_URL}/${heroId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteModel(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}