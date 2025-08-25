import { AboutImage } from "@/types/aboutImage";

export interface ContentItem {
  content_tr: string;
  content_en: string;
}

export interface About {
  id: string;
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  createdAt: string;
  updatedAt: string;
  images?: AboutImage[];
}
