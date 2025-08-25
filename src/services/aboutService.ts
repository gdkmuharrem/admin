import api from "@/libs/api";
import { About, ContentItem } from "@/types/about";
import { AboutImage } from "@/types/aboutImage";

const BASE_URL = "/about";

export interface AboutInput {
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  images?: AboutImage[];
}

export class AboutService {
  // Yeni About oluştur
  async createAbout(data: AboutInput): Promise<About> {
    const response = await api.post<About>(BASE_URL, data);
    return response.data;
  }

  // Tüm About kayıtlarını getir
  async getAllAbouts(): Promise<About[]> {
    const response = await api.get<About[]>(BASE_URL);
    return response.data;
  }

  // Id ile About getir
  async getAboutById(id: string): Promise<About> {
    const response = await api.get<About>(`${BASE_URL}/${id}`);
    return response.data;
  }

  // Id ile About güncelle
  async updateAbout(id: string, data: Partial<AboutInput>): Promise<About> {
    const response = await api.patch<About>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  // Id ile About sil
  async deleteAbout(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}
