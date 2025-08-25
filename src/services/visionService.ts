import api from "@/libs/api";
import { Vision, ContentItem } from "@/types/vision";
import { VisionImage } from "@/types/visionImage";

const BASE_URL = "/vision";

interface VisionInput {
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  images?: VisionImage[];
}

export class VisionService {
  // Yeni Vision oluştur
  async createVision(data: VisionInput): Promise<Vision> {
    const response = await api.post<Vision>(BASE_URL, data);
    return response.data;
  }

  // Tüm Vision kayıtlarını getir
  async getAllVisions(): Promise<Vision[]> {
    const response = await api.get<Vision[]>(`${BASE_URL}`);
    return response.data;
  }

  // Id ile Vision getir
  async getVisionById(id: string): Promise<Vision> {
    const response = await api.get<Vision>(`${BASE_URL}/${id}`);
    return response.data;
  }

  // Id ile Vision güncelle
  async updateVision(id: string, data: Partial<VisionInput>): Promise<Vision> {
    const response = await api.patch<Vision>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  // Id ile Vision sil
  async deleteVision(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}
