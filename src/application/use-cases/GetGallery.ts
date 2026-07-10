import type { GalleryRepository } from "@/domain/repositories/GalleryRepository";
import type { GalleryItem } from "@/domain/entities/GalleryItem";

/** 갤러리 항목을 조회하는 유스케이스. */
export class GetGallery {
  constructor(private readonly repository: GalleryRepository) {}

  execute(): Promise<readonly GalleryItem[]> {
    return this.repository.getItems();
  }
}
