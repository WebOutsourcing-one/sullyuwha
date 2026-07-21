import type { SVGProps } from "react";

/**
 * 설유화 라인 엠블럼 아이콘 세트.
 * 모두 currentColor 스트로크 기반 — 부모의 text 색을 따른다.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 매화(설유화) 5판 꽃 — 로고/포인트용 */
export function Emblem({ ...props }: IconProps) {
  const petals: [number, number][] = [
    [12, 7.6],
    [7.9, 10.6],
    [9.5, 15.4],
    [14.5, 15.4],
    [16.1, 10.6],
  ];
  return (
    <svg {...base} {...props}>
      {petals.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.7} />
      ))}
      <circle cx={12} cy={11.7} r={1} />
    </svg>
  );
}

/** TRADITION — 원 안의 매화(전통) */
export function IconTradition(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx={12} cy={12} r={10.5} />
      {(
        [
          [12, 8.4],
          [8.9, 10.7],
          [10.1, 14.4],
          [13.9, 14.4],
          [15.1, 10.7],
        ] as [number, number][]
      ).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.9} />
      ))}
      <circle cx={12} cy={11.9} r={0.7} />
    </svg>
  );
}

/** CRAFTSMANSHIP — 바늘과 실(장인) */
export function IconCraft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx={12} cy={12} r={10.5} />
      <path d="M7.5 16.5 16 8" />
      <circle cx={7} cy={17} r={1.1} />
      <path d="M16 8c1.2-.6 1.7.9 .6 1.5-1 .5-1.9-.2-1.2-1.2" />
    </svg>
  );
}

/** BESPOKE — 원 안의 마름모(맞춤) */
export function IconBespoke(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx={12} cy={12} r={10.5} />
      <path d="M12 6.5 16.5 12 12 17.5 7.5 12z" />
      <path d="M12 9.5 14.2 12 12 14.5 9.8 12z" />
    </svg>
  );
}

/** HERITAGE — 동심원 + 점(이어짐) */
export function IconHeritage(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx={12} cy={12} r={10.5} />
      <circle cx={12} cy={12} r={6.2} />
      <circle cx={12} cy={12} r={2} />
    </svg>
  );
}

/** 상담 및 기획 — 문서 */
export function IconConsult(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h7l3.5 3.5v13.5H7z" />
      <path d="M14 3.5V7h3.5" />
      <path d="M9.5 12h5M9.5 15h5M9.5 9h2.5" />
    </svg>
  );
}

/** 디자인 제안 — 펜촉 */
export function IconDesign(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 15 12l-3 3-3-3z" />
      <path d="M12 15v5.5" />
      <path d="M10.6 8.5h2.8" />
    </svg>
  );
}

/** 원단 선정 — 물결 원단 */
export function IconFabric(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0" />
      <path d="M3.5 12c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0" />
      <path d="M3.5 16.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0" />
    </svg>
  );
}

/** 수작업 제작 — 가위 */
export function IconHandcraft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx={7} cy={7.5} r={2.2} />
      <circle cx={7} cy={16.5} r={2.2} />
      <path d="M8.8 8.9 20 16.5M8.8 15.1 20 7.5" />
    </svg>
  );
}

/** 피팅 및 완성 — 옷걸이 */
export function IconFitting(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5.5a1.6 1.6 0 1 1 1.6 1.6c-.9 0-1.6.7-1.6 1.6" />
      <path d="M12 8.7 4 14.5c-1 .7-.5 2.2.7 2.2h14.6c1.2 0 1.7-1.5.7-2.2L12 8.7z" />
    </svg>
  );
}

/** 화살표 → */
export function IconArrow(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5" />
    </svg>
  );
}

/** 데이터 키로 아이콘을 고르기 위한 매핑 */
export const featureIcons = {
  tradition: IconTradition,
  craft: IconCraft,
  bespoke: IconBespoke,
  heritage: IconHeritage,
} as const;

export const processIcons = {
  consult: IconConsult,
  design: IconDesign,
  fabric: IconFabric,
  handcraft: IconHandcraft,
  fitting: IconFitting,
} as const;

export type FeatureIconKey = keyof typeof featureIcons;
export type ProcessIconKey = keyof typeof processIcons;
