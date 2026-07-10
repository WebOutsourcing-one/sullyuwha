import type { GalleryItem } from "../entities/GalleryItem";

/** 갤러리 항목 조회 계약. */
export interface GalleryRepository {
  getItems(): Promise<readonly GalleryItem[]>;
}
