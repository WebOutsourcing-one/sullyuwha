import type { Image } from "../value-objects/Image";

/** 문의 · 스토어 섹션의 정보. */
export interface ContactInfo {
  readonly showroomName: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  /** 운영 시간 등 라벨-값 목록 */
  readonly hours: readonly LabeledValue[];
  /** 구매 · 입점 문의 안내 */
  readonly note: string;
  readonly socials: readonly SocialLink[];
  /** 약도/위치 이미지(선택) */
  readonly mapImage?: Image;
}

export interface LabeledValue {
  readonly label: string;
  readonly value: string;
}

export interface SocialLink {
  readonly label: string;
  readonly url: string;
}
