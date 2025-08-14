import { AboutImage } from "@/types/aboutImage";

export interface About {
  id: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  createdAt: string;
  updatedAt: string;
  images?: AboutImage[];
}
