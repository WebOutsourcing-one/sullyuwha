"use client";

import { useState } from "react";
import type { Image } from "@/domain/value-objects/Image";
import { R2Image } from "./R2Image";

interface ProductGalleryProps {
  /** 표시할 미디어(사진·GIF). 첫 항목이 대표 컷. */
  images: readonly Image[];
  /** 대표 컷 우선 로드 */
  priority?: boolean;
}

/**
 * 제품 상세의 이미지 갤러리.
 * 좌/우 화살표·썸네일·키보드(←/→)로 수동 이동한다. (자동 재생 없음)
 */
export function ProductGallery({ images, priority }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const safeIndex = Math.min(index, count - 1);
  const current = images[safeIndex];

  // 단일 이미지면 캐러셀 UI 없이 그대로 렌더링한다.
  if (count <= 1) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne">
        <R2Image
          image={current}
          sizes="(max-width: 1024px) 92vw, 46vw"
          priority={priority}
        />
      </div>
    );
  }

  const go = (delta: number) => setIndex((prev) => (prev + delta + count) % count);

  return (
    <div
      className="flex flex-col gap-3"
      role="group"
      aria-roledescription="이미지 캐러셀"
      aria-label="제품 이미지"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
    >
      {/* 메인 프레임 */}
      <div className="group relative aspect-[3/4] overflow-hidden bg-champagne">
        <R2Image
          image={current}
          sizes="(max-width: 1024px) 92vw, 46vw"
          priority={priority}
        />

        {/* 이전 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 이미지"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/70 bg-ivory/80 text-charcoal opacity-100 backdrop-blur-sm transition-all duration-300 ease-silk hover:bg-ivory md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <Chevron direction="left" />
        </button>

        {/* 다음 */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 이미지"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/70 bg-ivory/80 text-charcoal opacity-100 backdrop-blur-sm transition-all duration-300 ease-silk hover:bg-ivory md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <Chevron direction="right" />
        </button>

        {/* 카운터 */}
        <div className="absolute bottom-3 right-3 rounded-full bg-charcoal/55 px-2.5 py-1 text-[0.7rem] tracking-wide text-ivory backdrop-blur-sm">
          {safeIndex + 1} / {count}
        </div>
      </div>

      {/* 썸네일 */}
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => {
          const selected = i === safeIndex;
          return (
            <li key={img.asset.value} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`이미지 ${i + 1} 보기`}
                aria-current={selected}
                className={`relative block aspect-square w-16 overflow-hidden border transition-all duration-300 ease-silk ${
                  selected
                    ? "border-gold"
                    : "border-line/60 opacity-60 hover:opacity-100"
                }`}
              >
                <R2Image image={img} sizes="72px" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* 스크린리더용 현재 위치 안내 */}
      <span className="sr-only" aria-live="polite">
        {count}장 중 {safeIndex + 1}번째 이미지: {current.alt}
      </span>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "left" ? "-ml-0.5" : "ml-0.5"}
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
