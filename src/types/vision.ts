import { VisionImage } from "@/types/visionImage";

export interface Vision {
  id: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  createdAt: string;
  updatedAt: string;
  images?: VisionImage[];
}
