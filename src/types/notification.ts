export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
  relatedId?: string | null;
}
