export interface Review {
  id: string;
  name: string;
  email: string;
  content: string;
  productId?: string | null;
  approved: boolean;
  createdAt: string;
  isActive: boolean;
}

export interface ReviewInput {
  name: string;
  email: string;
  content: string;
  productId?: string | null;
}
