import { MisionImage } from "@/types/misionImage";

export interface Mision {
  id: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  createdAt: string;
  updatedAt: string;
  images?: MisionImage[];
}
