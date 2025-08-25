import api from '@/libs/api';
import { Review } from '@/types/review';

const BASE_URL = '/review';

export interface ReviewInput {
  name: string;
  email: string;
  content: string;
  productId?: string | null;
}

const reviewService = {
  sendReview: async (data: ReviewInput): Promise<Review> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getReviewById: async (id: string): Promise<Review | null> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  updateApproval: async (id: string, approved: boolean): Promise<Review> => {
    const response = await api.patch(`${BASE_URL}/${id}`, { approved });
    return response.data;
  },

  markAsRead: async (id: string): Promise<Review> => {
    const response = await api.patch(`${BASE_URL}/${id}/read`); // opsiyonel, backend desteği olmalı
    return response.data;
  }
};

export const publicReviewService = {
  sendReview: reviewService.sendReview,
};

export const adminReviewService = reviewService;
