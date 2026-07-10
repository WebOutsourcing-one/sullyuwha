import { loadEnv } from "@/infrastructure/config/env";
import {
  R2AssetResolver,
  type AssetResolver,
} from "@/infrastructure/assets/R2AssetResolver";

/**
 * 에셋 리졸버 싱글턴.
 * 데이터/유스케이스에 의존하지 않으므로 프레젠테이션 어디서든 가볍게 임포트할 수 있다.
 */
export const assetResolver: AssetResolver = new R2AssetResolver(
  loadEnv().assetBaseUrl,
);
