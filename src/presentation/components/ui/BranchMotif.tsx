import Image from "next/image";

interface BranchMotifProps {
  /** ink(차콜) — 밝은 배경 / ivory(아이보리) — 어두운 배경 */
  variant?: "ink" | "ivory";
  /** 절대배치 위치·크기 클래스 (예: "top-0 right-0 h-[62%] w-[55%]") */
  className?: string;
  /** 0~1 투명도 (은은하게) */
  opacity?: number;
  /** 좌우 반전으로 변주 */
  flip?: boolean;
  /** object-position (예: "top right") */
  position?: string;
}

const SRC = {
  ink: "/branch-ink.png",
  ivory: "/branch-ink-ivory.png",
} as const;

/**
 * 설유화 꽃가지 먹선(그림)을 섹션 배경에 여백처럼 얹는 장식 모티프.
 * 장식용이므로 aria-hidden · 빈 alt. 콘텐츠는 z-10로 위에 둔다.
 */
export function BranchMotif({
  variant = "ink",
  className,
  opacity = 0.1,
  flip = false,
  position = "center",
}: BranchMotifProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 select-none overflow-hidden ${className ?? ""}`}
      style={{ opacity }}
    >
      <Image
        src={SRC[variant]}
        alt=""
        fill
        sizes="60vw"
        className="object-contain"
        style={{
          objectPosition: position,
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      />
    </div>
  );
}
