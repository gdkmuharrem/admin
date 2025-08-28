import api from "@/libs/api";
import { Hero } from "@/types/hero";

const BASE_URL = "/hero";

export interface HeroInput {
  isActive: boolean;
}

export class HeroService {
  // Yeni Hero oluştur
  async createHero(data: HeroInput): Promise<Hero> {
    const response = await api.post<Hero>(BASE_URL, data);
    return response.data;
  }

  // Tüm Hero kayıtlarını getir
  async getAllHeroes(): Promise<Hero[]> {
    const response = await api.get<Hero[]>(BASE_URL);
    return response.data;
  }

  // Id ile Hero getir
  async getHeroById(id: string): Promise<Hero> {
    const response = await api.get<Hero>(`${BASE_URL}/${id}`);
    return response.data;
  }

  // Id ile Hero güncelle
  async updateHero(id: string, data: Partial<HeroInput>): Promise<Hero> {
    const response = await api.patch<Hero>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  // Id ile Hero sil
  async deleteHero(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}