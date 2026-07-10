import type { GalleryRepository } from "@/domain/repositories/GalleryRepository";
import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { galleryData } from "../data/gallery.data";

/** 정적 데이터 기반 GalleryRepository 구현. */
export class StaticGalleryRepository implements GalleryRepository {
  async getItems(): Promise<readonly GalleryItem[]> {
    return galleryData;
  }
}
