"use client";

import { useEffect, useState } from "react";
import type { Image } from "@/domain/value-objects/Image";
import { R2Image } from "./R2Image";

interface ModelShotCarouselProps {
  shots: readonly Image[];
}

const INTERVAL = 4000;

/**
 * 모델 컷 자동 회전 캐러셀.
 * 큰 컷 하나를 보여주고 일정 간격으로 넘어가며, 우측 세로 썸네일로 수동 이동할 수 있다.
 */
export function ModelShotCarousel({ shots }: ModelShotCarouselProps) {
  const count = shots.length;
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, count - 1);
  const current = shots[safeIndex];

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % count),
      INTERVAL,
    );
    return () => clearInterval(id);
  }, [count]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div className="flex items-start gap-4">
      {/* 큰 메인 컷 */}
      <div className="group relative aspect-[3/4] min-w-0 flex-1 overflow-hidden bg-champagne">
        <R2Image
          image={current}
          sizes="(max-width: 1024px) 82vw, 42vw"
        />
        <button
          type="button"
          onClick={() => go(safeIndex - 1)}
          aria-label="이전 모델 컷"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/70 bg-ivory/80 text-charcoal opacity-100 backdrop-blur-sm transition-all duration-300 ease-silk hover:bg-ivory md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => go(safeIndex + 1)}
          aria-label="다음 모델 컷"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/70 bg-ivory/80 text-charcoal opacity-100 backdrop-blur-sm transition-all duration-300 ease-silk hover:bg-ivory md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <Chevron direction="right" />
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-charcoal/55 px-2.5 py-1 text-[0.7rem] tracking-wide text-ivory backdrop-blur-sm">
          {safeIndex + 1} / {count}
        </div>
      </div>

      {/* 우측 세로 썸네일 */}
      <ul className="flex w-16 shrink-0 flex-col gap-2">
        {shots.map((shot, i) => {
          const selected = i === safeIndex;
          return (
            <li key={shot.asset.value}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`모델 컷 ${i + 1} 보기`}
                aria-current={selected}
                className={`relative block aspect-[3/4] w-full overflow-hidden border transition-all duration-300 ease-silk ${
                  selected
                    ? "border-gold"
                    : "border-line/60 opacity-60 hover:opacity-100"
                }`}
              >
                <R2Image image={shot} sizes="64px" />
              </button>
            </li>
          );
        })}
      </ul>

      <span className="sr-only" aria-live="polite">
        {count}장 중 {safeIndex + 1}번째 모델 컷: {current.alt}
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
