import type { GalleryRepository } from "@/domain/repositories/GalleryRepository";
import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { getPrisma } from "@/infrastructure/db/prisma";

export class DbGalleryRepository implements GalleryRepository {
  async getItems(): Promise<readonly GalleryItem[]> {
    const prisma = getPrisma();
    const rows = await prisma.galleryItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      image: {
        asset: assetKey(r.assetKey),
        alt: r.alt,
        aspectRatio: r.aspectRatio ?? undefined,
        ext: r.ext ?? undefined,
      },
      caption: r.caption,
      span: r.span as "normal" | "tall" | "wide",
    }));
  }
}
