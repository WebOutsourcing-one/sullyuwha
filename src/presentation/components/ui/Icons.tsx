import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseSm = {
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
    <svg {...baseSm} {...props}>
      {petals.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.7} />
      ))}
      <circle cx={12} cy={11.7} r={1} />
    </svg>
  );
}

/** 상담 및 기획 · 저고리 */
export function IconConsult(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M32 19c-3 0-5 1-7 2-5 2-10 4-12 9-1 3-1 6 1 8 1 1 3 1 4 0l2-2v9c0 3 2 5 5 5h14c3 0 5-2 5-5v-9l2 2c1 1 3 1 4 0 2-2 2-5 1-8-2-5-7-7-12-9-2-1-4-2-7-2z"/>
      <path d="M25 21c2 3 4 5 7 7 3-2 5-4 7-7"/>
      <path d="M32 28v6"/>
      <path d="M32 34c-1 2-3 3-5 4"/>
      <path d="M32 34c1 2 3 3 5 4"/>
    </svg>
  );
}

/** 디자인 제안 · 노리개 */
export function IconDesign(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="32" cy="14" r="3.5"/>
      <path d="M32 17.5v4"/>
      <path d="M32 21.5c-8 0-12 6-12 12 0 8 6 13.5 12 16.5 6-3 12-8.5 12-16.5 0-6-4-12-12-12z"/>
      <circle cx="32" cy="29" r="2"/>
      <path d="M32 33v10"/>
    </svg>
  );
}

/** 원단 선정 · 매듭 */
export function IconFabric(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <g transform="translate(32 32) rotate(45)">
        <rect x="-13.5" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="-6" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="1.5" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="9" y="-13.5" width="4.5" height="27" rx="2.25"/>
      </g>
      <g transform="translate(32 32) rotate(135)">
        <rect x="-13.5" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="-6" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="1.5" y="-13.5" width="4.5" height="27" rx="2.25"/>
        <rect x="9" y="-13.5" width="4.5" height="27" rx="2.25"/>
      </g>
    </svg>
  );
}

/** 수작업 제작 · 가위 */
export function IconHandcraft(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="23" cy="46" r="5.5"/>
      <circle cx="41" cy="46" r="5.5"/>
      <path d="M26.5 42 L45 14"/>
      <path d="M37.5 42 L19 14"/>
      <circle cx="32" cy="33" r="1.7"/>
    </svg>
  );
}

/** 피팅 및 완성 · 복주머니 */
export function IconFitting(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 20h20"/>
      <path d="M27 20c-2 3-2 5-1 7"/>
      <path d="M37 20c2 3 2 5 1 7"/>
      <path d="M26 27c-6 4-9 10-9 15 0 6 7 9 15 9s15-3 15-9c0-5-3-11-9-15z"/>
      <circle cx="32" cy="40" r="3.5"/>
      <circle cx="32" cy="40" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

/** 화살표 → */
export function IconArrow(props: IconProps) {
  return (
    <svg {...baseSm} {...props}>
      <path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5" />
    </svg>
  );
}

/** 인스타그램 */
export function IconInstagram(props: IconProps) {
  return (
    <svg {...baseSm} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.2} cy={6.8} r={0.6} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 설유화의 가치 — 라인 SVG 대신 쓰는 커스텀 아이콘 이미지(전통 문양을 그대로 딴 래스터). */
export const featureIconImages = {
  tradition: "/icons/value-tradition.webp",
  craft: "/icons/value-craft.webp",
  bespoke: "/icons/value-bespoke.webp",
  heritage: "/icons/value-heritage.webp",
} as const;

export const processIcons = {
  consult: IconConsult,
  design: IconDesign,
  fabric: IconFabric,
  handcraft: IconHandcraft,
  fitting: IconFitting,
} as const;

export type FeatureIconKey = keyof typeof featureIconImages;
export type ProcessIconKey = keyof typeof processIcons;
