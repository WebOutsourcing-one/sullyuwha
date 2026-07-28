import { loadPublicEnv } from "@/infrastructure/config/env";
import { R2AssetResolver, type AssetResolver } from "@/infrastructure/assets/R2AssetResolver";

/**
 * URL 해석용 — 공개 베이스 URL만 사용한다.
 * `R2Image` 등 클라이언트 컴포넌트에서 import되므로 이 모듈은 클라이언트 번들에 실린다.
 * 따라서 서버 비밀값(S3 자격증명 등)을 다루는 코드는 절대 여기에 두지 않는다.
 * S3 업로드/관리용 리졸버는 `assets.server.ts`에 있다.
 */
export const assetResolver: AssetResolver = new R2AssetResolver(
  loadPublicEnv().assetBaseUrl,
);
