import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { getPrisma } from "@/infrastructure/db/prisma";
import type { AssetResolver } from "@/infrastructure/assets/R2AssetResolver";
import { StaticBrandContentRepository } from "./StaticBrandContentRepository";

/**
 * 시드하지 않은 DB에서도 화면이 뜨도록 쓰는 기본값.
 *
 * 브랜드 콘텐츠는 관리자 화면에 편집 기능이 없어서 오직 `bun run db:seed`로만 들어간다.
 * 예전에는 행이 없으면 `findUniqueOrThrow`가 던져 **홈이 통째로 500**이 됐다.
 * DB를 붙이고 시드를 깜빡한 배포에서 사이트 전체가 죽는 것보다,
 * 기본 문구로라도 뜨는 편이 낫다. (상품 목록은 원래 빈 배열이라 영향이 없다)
 */
const fallback = new StaticBrandContentRepository();

export class DbBrandContentRepository implements BrandContentRepository {
  constructor(private readonly assets: AssetResolver) {}

  async getHero(): Promise<HeroContent> {
    const prisma = getPrisma();
    const row = await prisma.heroContent.findUnique({ where: { id: "default" } });
    if (!row) {
      warnMissing("heroContent");
      return fallback.getHero();
    }
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
    const row = await prisma.brandStory.findUnique({ where: { id: "default" } });
    if (!row) {
      warnMissing("brandStory");
      return fallback.getStory();
    }
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
    if (rows.length === 0) {
      warnMissing("silkFeature");
      return fallback.getSilkFeatures();
    }
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
    const row = await prisma.contactInfo.findUnique({ where: { id: "default" } });
    if (!row) {
      warnMissing("contactInfo");
      return fallback.getContact();
    }
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

/** 시드 누락은 조용히 넘기면 안 된다 — 왜 기본 문구가 나오는지 알 수 있어야 한다. */
function warnMissing(table: string): void {
  console.warn(
    `[content] ${table} 행이 없어 기본값으로 렌더합니다. ` +
      "`bun run db:seed`(운영: `bun prisma/seed.ts`)로 초기 콘텐츠를 넣으세요.",
  );
}
