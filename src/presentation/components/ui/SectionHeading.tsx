interface SectionHeadingProps {
  /** 넓은 자간 라틴 라벨. 예) COLLECTION */
  eyebrow: string;
  title: string;
  /** h2에 연결할 id (섹션 aria-labelledby용) */
  titleId?: string;
  align?: "left" | "center";
  /** 어두운 배경 위에서 밝은 텍스트로 반전 */
  invert?: boolean;
  subcopy?: string;
}

/** 섹션 상단 제목 블록 — 골드 헤어라인 + 라틴 라벨 + 얇은 세리프 제목. */
export function SectionHeading({
  eyebrow,
  title,
  titleId,
  align = "center",
  invert = false,
  subcopy,
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const titleColor = invert ? "text-ivory" : "text-charcoal";
  const subColor = invert ? "text-ivory/65" : "text-taupe";

  return (
    <div className={`flex flex-col gap-5 ${alignment}`}>
      <div
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-6 bg-gold" aria-hidden />
        <span className="u-label">{eyebrow}</span>
      </div>
      <h2
        id={titleId}
        className={`text-[clamp(1.9rem,4vw,3.25rem)] font-light ${titleColor}`}
      >
        {title}
      </h2>
      {subcopy && (
        <p
          className={`max-w-xl text-[clamp(0.95rem,1.05vw,1.0625rem)] leading-relaxed ${subColor} ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subcopy}
        </p>
      )}
    </div>
  );
}
