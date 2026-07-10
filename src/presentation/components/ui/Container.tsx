import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** 콘텐츠 최대폭 + 좌우 거터를 적용하는 래퍼. */
export function Container({ children, className }: ContainerProps) {
  return <div className={`u-container ${className ?? ""}`}>{children}</div>;
}
