import { VisionImage } from "@/types/visionImage";

export interface ContentItem {
  content_tr: string;
  content_en: string;
}

export interface Vision {
  id: string;
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  createdAt: string;
  updatedAt: string;
  images?: VisionImage[];
}