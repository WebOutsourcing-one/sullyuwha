"use client";

import { useState } from "react";
import NextImage from "next/image";
import type { Image as ImageEntity } from "@/domain/value-objects/Image";
import { assetResolver } from "@/composition/assets";

interface R2ImageProps {
  image: ImageEntity;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * 로딩 표시와 실패 폴백에 같은 브랜드 엠블럼을 쓴다.
 * 예전에는 같은 그림을 두 파일로 들고 있어서 하나로 합쳤다.
 *
 * **크기에 민감한 파일이다.** 사이트에서 가장 많이 렌더되는 이미지라,
 * 에셋이 아직 없는 화면에서는 한 페이지에 수십 번 나온다. 원본이 크면
 * next/image가 크기별로 최적화할 때마다 그 원본을 통째로 메모리에 올린다 —
 * 2.6MB PNG 시절에는 총 1GB짜리 인스턴스에서 그것만으로 무거웠다.
 * 지금은 800px WebP(50KB)다. 교체할 때 이 크기를 유지한다.
 *
 * S3가 아니라 `public/`에 두는 이유 — 이 그림은 **S3 이미지가 실패했을 때**
 * 나가는 대체물이다. S3에 두면 막으려던 것에 의존하게 된다.
 */
const PLACEHOLDER_SRC = "/placeholder.webp";

/**
 * 에셋 URL을 해석해 렌더하고, 로딩 중·실패 시 플레이스홀더를 보여준다.
 *
 * src를 이펙트로 옮기지 않고 렌더 중에 계산하는 이유 —
 * 예전에는 초기 상태가 플레이스홀더였다가 이펙트에서 실제 URL로 바꿨는데,
 * 그러면 **모든 이미지가 플레이스홀더를 먼저 한 번 요청**하고 나서
 * 실제 이미지를 다시 받았다. 파생값으로 계산하면 그 낭비와 연쇄 렌더가 사라진다.
 */
export function R2Image({ image, sizes, className, priority }: R2ImageProps) {
  const resolvedUrl = assetResolver.resolve(image.asset, image.ext);

  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 이미지가 바뀌면 로딩·실패 상태를 초기화한다.
  // (이펙트가 아니라 렌더 중 조정 — React가 권장하는 파생 상태 갱신 방식이다)
  const [trackedUrl, setTrackedUrl] = useState(resolvedUrl);
  if (trackedUrl !== resolvedUrl) {
    setTrackedUrl(resolvedUrl);
    setFailed(false);
    setLoaded(false);
  }

  const src = !resolvedUrl || failed ? PLACEHOLDER_SRC : resolvedUrl;
  // 해석된 URL이 없으면 기다릴 것이 없으므로 로딩 화면을 띄우지 않는다.
  const showLoading = Boolean(resolvedUrl) && !loaded && !failed;

  return (
    <>
      {showLoading && (
        <div
          role="img"
          aria-label={image.alt}
          className={`absolute inset-0 ${className ?? ""}`}
        >
          {/* sizes를 실제 이미지와 맞춘다. 빠뜨리면 fill의 기본값이 100vw라
              로딩 표시 하나에 뷰포트 폭짜리 파생본을 받아 온다. */}
          <NextImage src={PLACEHOLDER_SRC} alt="" fill sizes={sizes} className="object-cover" />
        </div>
      )}
      <NextImage
        src={src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={image.ext === "gif"}
        className={`object-cover ${className ?? ""}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
