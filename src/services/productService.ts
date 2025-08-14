// src/services/productService.ts

import api from '@/libs/api';
import { Product, Category } from '@/types/product';

export async function fetchProducts(): Promise<Product[]> {
  const res = await api.get('/product');
  return res.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get('/category');
  return res.data;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await api.post('/product', product);
  return res.data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const res = await api.patch(`/product/${id}`, product);
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/product/${id}`);
}
