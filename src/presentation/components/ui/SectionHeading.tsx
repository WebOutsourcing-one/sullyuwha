interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** h2에 연결할 id (섹션 aria-labelledby용) */
  titleId?: string;
  align?: "left" | "center";
  /** 어두운 배경 위에서 밝은 텍스트로 반전 */
  invert?: boolean;
}

/** 섹션 상단 제목 블록 — 황토색 선 + 부제 + 명조 제목. */
export function SectionHeading({
  eyebrow,
  title,
  titleId,
  align = "left",
  invert = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start";
  const titleColor = invert ? "text-hanji" : "text-meok";

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      <div
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-8 bg-hwangto" aria-hidden />
        <span className="text-sm font-medium tracking-wide text-hwangto">
          {eyebrow}
        </span>
      </div>
      <h2
        id={titleId}
        className={`text-[clamp(1.75rem,3.5vw,2.75rem)] ${titleColor}`}
      >
        {title}
      </h2>
    </div>
  );
}
