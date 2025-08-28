import { HeroImage } from "@/types/heroImage";
import { HeroModel } from "@/types/heroModel";

export interface Hero {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: HeroImage[];
  models?: HeroModel[];
}