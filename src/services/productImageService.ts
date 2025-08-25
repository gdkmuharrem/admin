// src/services/productImageService.ts

import api from '@/libs/api';
import { ProductImage } from '@/types/productImage';

const BASE_URL = '/product-image';

export async function getImagesByProduct(productId: string): Promise<ProductImage[]> {
  const res = await api.get(`${BASE_URL}/${productId}`);
  return res.data;
}

export async function uploadImage(productId: string, file: File): Promise<ProductImage> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`${BASE_URL}/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

export async function deleteImage(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
