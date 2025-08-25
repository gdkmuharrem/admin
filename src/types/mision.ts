import { MisionImage } from "@/types/misionImage";

export interface ContentItem {
  content_tr: string;
  content_en: string;
}

export interface Mision {
  id: string;
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  createdAt: string;
  updatedAt: string;
  images?: MisionImage[];
}