import api from '@/libs/api';
import { VisionImage } from '@/types/visionImage';

const BASE_URL = '/vision-image';

export async function getImagesByVision(visionId: string): Promise<VisionImage[]> {
  const res = await api.get(`${BASE_URL}/${visionId}`);
  return res.data;
}

export async function uploadImage(visionId: string, file: File): Promise<VisionImage> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`${BASE_URL}/${visionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
