// src/types/product.ts

export interface Category {
  id: string;
  name_tr: string;
  name_en: string;
}

export interface Product {
  id: string;
  name_tr: string;
  name_en: string;
  description_tr?: string | null;
  description_en?: string | null;
  price: number;
  categoryId: string;
  category?: Category;
  isActive: boolean;
}
