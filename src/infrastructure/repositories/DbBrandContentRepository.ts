import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { getPrisma } from "@/infrastructure/db/prisma";
import type { AssetResolver } from "@/infrastructure/assets/R2AssetResolver";

export class DbBrandContentRepository implements BrandContentRepository {
  constructor(private readonly assets: AssetResolver) {}

  async getHero(): Promise<HeroContent> {
    const prisma = getPrisma();
    const row = await prisma.heroContent.findUniqueOrThrow({ where: { id: "default" } });
    return {
      eyebrow: row.eyebrow,
      slogan: row.slogan,
      subcopy: row.subcopy,
      primaryCta: { label: row.primaryCtaLabel, href: row.primaryCtaHref },
      secondaryCta: { label: row.secondaryCtaLabel, href: row.secondaryCtaHref },
      image: {
        asset: assetKey(row.imageAssetKey),
        alt: row.imageAlt,
        aspectRatio: row.imageAspectRatio ?? undefined,
        ext: row.imageExt ?? undefined,
      },
    };
  }

  async getStory(): Promise<BrandStory> {
    const prisma = getPrisma();
    const row = await prisma.brandStory.findUniqueOrThrow({ where: { id: "default" } });
    return {
      eyebrow: row.eyebrow,
      title: row.title,
      paragraphs: row.paragraphs as string[],
      nameMeaning: {
        reading: row.nameMeaningReading,
        meaning: row.nameMeaningMeaning,
      },
      image: {
        asset: assetKey(row.imageAssetKey),
        alt: row.imageAlt,
        aspectRatio: row.imageAspectRatio ?? undefined,
        ext: row.imageExt ?? undefined,
      },
    };
  }

  async getSilkFeatures(): Promise<readonly SilkFeature[]> {
    const prisma = getPrisma();
    const rows = await prisma.silkFeature.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      title: r.title,
      description: r.description,
      image: r.imageAssetKey
        ? { asset: assetKey(r.imageAssetKey), alt: r.imageAlt ?? "", aspectRatio: r.imageAspectRatio ?? undefined, ext: r.imageExt ?? undefined }
        : undefined,
    }));
  }

  async getContact(): Promise<ContactInfo> {
    const prisma = getPrisma();
    const row = await prisma.contactInfo.findUniqueOrThrow({ where: { id: "default" } });
    return {
      showroomName: row.showroomName,
      address: row.address,
      phone: row.phone,
      email: row.email,
      hours: row.hours as { label: string; value: string }[],
      note: row.note,
      socials: row.socials as { label: string; url: string }[],
      mapImage: row.imageAssetKey
        ? { asset: assetKey(row.imageAssetKey), alt: row.imageAlt ?? "", aspectRatio: row.imageAspectRatio ?? undefined, ext: row.imageExt ?? undefined }
        : undefined,
    };
  }
}
