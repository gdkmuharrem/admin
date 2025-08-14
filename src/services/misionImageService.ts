import api from '@/libs/api';
import { MisionImage } from '@/types/misionImage';

const BASE_URL = '/mision-image';

export async function getImagesByMision(misionId: string): Promise<MisionImage[]> {
  const res = await api.get(`${BASE_URL}/${misionId}`);
  return res.data;
}

export async function uploadImage(misionId: string, file: File): Promise<MisionImage> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`${BASE_URL}/${misionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
