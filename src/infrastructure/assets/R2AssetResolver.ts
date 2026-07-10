import type { AssetKey } from "@/domain/value-objects/AssetKey";

/**
 * 에셋 키를 실제 접근 가능한 URL로 변환하는 서비스.
 * 도메인/애플리케이션은 이 인터페이스를 모른다 — 프레젠테이션 계층만 사용한다.
 */
export interface AssetResolver {
  /** 저장소가 설정되어 있으면 true. false면 플레이스홀더로 렌더링해야 한다. */
  readonly isConfigured: boolean;
  /**
   * 에셋 키를 공개 URL로 변환한다.
   * @returns 설정 시 URL, 미설정 시 null
   */
  resolve(key: AssetKey, ext?: string): string | null;
}

/**
 * Cloudflare R2 공개 버킷(커스텀 도메인) 기반 리졸버.
 * `{baseUrl}/{key}.{ext}` 형태의 URL을 만든다.
 */
export class R2AssetResolver implements AssetResolver {
  constructor(
    private readonly baseUrl: string | null,
    private readonly defaultExt: string = "jpg",
  ) {}

  get isConfigured(): boolean {
    return this.baseUrl !== null;
  }

  resolve(key: AssetKey, ext: string = this.defaultExt): string | null {
    if (!this.baseUrl) return null;
    return `${this.baseUrl}/${key.value}.${ext}`;
  }
}
