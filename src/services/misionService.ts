import api from "@/libs/api";
import { Mision, ContentItem } from "@/types/mision";
import { MisionImage } from "@/types/misionImage";

const BASE_URL = "/mision";

interface MisionInput {
  title_tr: string;
  title_en: string;
  contents: ContentItem[];
  images?: MisionImage[];
}

export class MisionService {
  // Yeni Mision oluştur
  async createMision(data: MisionInput): Promise<Mision> {
    const response = await api.post<Mision>(BASE_URL, data);
    return response.data;
  }

  // Tüm Mision kayıtlarını getir
  async getAllMisions(): Promise<Mision[]> {
    const response = await api.get<Mision[]>(`${BASE_URL}`);
    return response.data;
  }

  // Id ile Mision getir
  async getMisionById(id: string): Promise<Mision> {
    const response = await api.get<Mision>(`${BASE_URL}/${id}`);
    return response.data;
  }

  // Id ile Mision güncelle
  async updateMision(id: string, data: Partial<MisionInput>): Promise<Mision> {
    const response = await api.patch<Mision>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  // Id ile Mision sil
  async deleteMision(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}
