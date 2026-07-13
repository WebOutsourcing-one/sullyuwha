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
 * - 미설정(로컬 개발)이면 샴페인 그라디언트 플레이스홀더로 우아하게 대체
 */
export function R2Image({ image, sizes, className, priority }: R2ImageProps) {
  const url = assetResolver.resolve(image.asset, image.ext);

  if (!url) {
    return <SilkPlaceholder alt={image.alt} className={className} />;
  }

  return (
    <NextImage
      src={url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      // GIF는 최적화 시 애니메이션이 유실될 수 있어 원본 그대로 서빙한다.
      unoptimized={image.ext === "gif"}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

/** R2 미설정 시 표시되는 실크 톤 플레이스홀더. */
function SilkPlaceholder({
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
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-champagne ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, #efe9de 0%, #e7dfd0 55%, #ddceb6 100%)",
      }}
    >
      <span
        className="font-serif text-5xl font-light text-charcoal/12 select-none"
        aria-hidden
      >
        설
      </span>
    </div>
  );
}
