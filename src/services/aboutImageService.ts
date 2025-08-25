import api from '@/libs/api';
import { AboutImage } from '@/types/aboutImage';

const BASE_URL = '/about-image';

export async function getImagesByAbout(aboutId: string): Promise<AboutImage[]> {
  const res = await api.get(`${BASE_URL}/${aboutId}`);
  return res.data;
}

export async function uploadImage(aboutId: string, file: File): Promise<AboutImage> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`${BASE_URL}/${aboutId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
