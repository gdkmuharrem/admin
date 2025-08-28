import api from '@/libs/api';
import { HeroImage } from '@/types/heroImage';

const BASE_URL = '/hero-image';

export async function getImagesByHero(heroId: string): Promise<HeroImage[]> {
  const res = await api.get(`${BASE_URL}/${heroId}`);
  return res.data;
}

export async function uploadImage(heroId: string, file: File): Promise<HeroImage> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`${BASE_URL}/${heroId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}