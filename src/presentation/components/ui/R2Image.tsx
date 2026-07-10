import NextImage from "next/image";
import type { Image as ImageEntity } from "@/domain/value-objects/Image";
import { assetResolver } from "@/composition/assets";

interface R2ImageProps {
  image: ImageEntity;
  /** next/image sizes 속성 — 반응형 해상도 최적화에 필수 */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * R2 에셋을 렌더링하는 이미지 컴포넌트.
 * 부모는 반드시 `position: relative` + 크기(또는 aspect-ratio)를 가져야 한다(`fill` 사용).
 *
 * - 리졸버가 설정되어 있으면 next/image로 최적화 서빙
 * - 미설정(로컬 개발)이면 한지 그라디언트 플레이스홀더로 우아하게 대체
 */
export function R2Image({ image, sizes, className, priority }: R2ImageProps) {
  const url = assetResolver.resolve(image.asset);

  if (!url) {
    return <HanjiPlaceholder alt={image.alt} className={className} />;
  }

  return (
    <NextImage
      src={url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

/** R2 미설정 시 표시되는 한지 톤 플레이스홀더. */
function HanjiPlaceholder({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-hanji-deep ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, #f4ecd9 0%, #ece0c6 55%, #e3cfa8 100%)",
      }}
    >
      <div className="u-lattice absolute inset-0 opacity-[0.10]" aria-hidden />
      <span
        className="u-seal relative h-12 w-12 text-xl opacity-70"
        aria-hidden
      >
        華
      </span>
    </div>
  );
}
