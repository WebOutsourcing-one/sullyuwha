/** 맞춤 제작 과정 한 단계. */
export interface ProcessStep {
  readonly id: string;
  /** 아이콘 키(Icons.processIcons와 매칭) */
  readonly icon: string;
  /** 단계명. 예) 상담 및 기획 */
  readonly title: string;
}
