export interface Category {
  id: string;
  name_tr: string;
  name_en: string;
  slug_tr: string;
  slug_en: string;
  parentId?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
}

export interface CategoryInput {
  name_tr: string;
  name_en: string;
  parentId?: string | null;
  isActive?: boolean;
  order?: number;
}
