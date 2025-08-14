export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}


export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
