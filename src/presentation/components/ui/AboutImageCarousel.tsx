"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AboutImageCarouselProps {
  images: readonly { src: string; alt: string }[];
  sizes: string;
}

const INTERVAL_MS = 5000;
const FADE_MS = 700;

/**
 * ABOUT 섹션 이미지 자동 회전 + 하단 중앙 점 인디케이터.
 *
 * R2/어드민 업로드 파이프라인이 없는 콘텐츠라 public/의 고정 파일들을 직접 쓴다
 * (BespokeSection의 bespoke.webp와 같은 방식).
 *
 * 하나만 렌더하고 src를 바꾸는 대신 모든 컷을 겹쳐 두고 opacity로 크로스페이드한다 —
 * src를 바꾸면 매번 새로 로드하며 전환 사이에 빈 화면이 잠깐 보인다.
 *
 * 점을 눌러 수동으로 넘기면 그 시점부터 다시 5초를 센다 — 누르자마자 자동 전환이
 * 끼어들면 방금 고른 사진을 볼 새도 없이 넘어간다.
 */
export function AboutImageCarousel({ images, sizes }: AboutImageCarouselProps) {
  const count = images.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % count),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [count, index]);

  return (
    <>
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority={i === 0}
          sizes={sizes}
          className="object-cover transition-opacity ease-silk"
          style={{
            transitionDuration: `${FADE_MS}ms`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}

      {count > 1 && (
        <>
          {/* 사진이 밝을 때도 점이 묻히지 않게 하단만 살짝 어둡게 깐다. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal/45 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {images.map((img, i) => {
              const selected = i === index;
              return (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}번째 사진 보기`}
                  aria-current={selected}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-silk ${
                    selected
                      ? "w-5 bg-ivory"
                      : "w-1.5 bg-ivory/50 hover:bg-ivory/80"
                  }`}
                />
              );
            })}
          </div>
          <span className="sr-only" aria-live="polite">
            {count}장 중 {index + 1}번째 사진: {images[index].alt}
          </span>
        </>
      )}
    </>
  );
}
