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

const FALLBACK_SRC = "/placeholder.png";
const LOADING_SRC = "/loding.png";

/**
 * 에셋 URL을 해석해 렌더하고, 로딩 중·실패 시 플레이스홀더를 보여준다.
 *
 * src를 이펙트로 옮기지 않고 렌더 중에 계산하는 이유 —
 * 예전에는 초기 상태가 `/placeholder.png`였다가 이펙트에서 실제 URL로 바꿨는데,
 * 그러면 **모든 이미지가 2.2MB 플레이스홀더를 먼저 한 번 요청**하고 나서
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

  const src = !resolvedUrl || failed ? FALLBACK_SRC : resolvedUrl;
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
          <NextImage src={LOADING_SRC} alt="" fill sizes={sizes} className="object-cover" />
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
