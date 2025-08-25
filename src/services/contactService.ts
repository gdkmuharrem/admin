import api from '@/libs/api';  // axios instance
import { ContactMessage } from '@/types/contact';

const BASE_URL = '/contact';

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Tüm fonksiyonları içeren private servis objesi
const contactService = {
  sendMessage: async (data: ContactMessageInput): Promise<ContactMessage> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  getAllMessages: async (): Promise<ContactMessage[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getMessageById: async (id: string): Promise<ContactMessage | null> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  markAsRead: async (id: string): Promise<ContactMessage> => {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data;
  },

};

// **Ön yüz (public) servis** - sadece mesaj gönderme fonksiyonu
export const publicContactService = {
  sendMessage: contactService.sendMessage,
};

// **Admin panel servis** - tüm CRUD fonksiyonları açık
export const adminContactService = contactService;
