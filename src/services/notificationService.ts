import api from '@/libs/api';
import { Notification } from '@/types/notification';

const BASE_URL = '/notification';

// Temel servis objesi (admin'e özel işlemler burada)
const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await api.get(`${BASE_URL}/unread`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch(`${BASE_URL}/mark-all-read`);
  },
};

// Public erişim açmak istersen burada sınırlandırabilirsin (şimdilik gerek yok)
export const adminNotificationService = notificationService;
