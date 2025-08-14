import api from '@/libs/api';
import { Category, CategoryInput } from '@/types/category';

const BASE_URL = '/category';

const categoryService = {
  createCategory: async (data: CategoryInput): Promise<Category> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category | null> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CategoryInput>): Promise<Category> => {
    const response = await api.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};

export const adminCategoryService = categoryService;
