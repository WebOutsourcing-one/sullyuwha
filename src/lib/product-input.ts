import { Prisma } from "@/generated/prisma/client";
import { PRODUCT_CATEGORIES } from "@/domain/entities/Category";
import { toPrice } from "./price";

/** `includes`로 임의 문자열과 견주기 위해 넓힌 형태. 값은 그대로다. */
const ALLOWED_CATEGORIES: readonly string[] = PRODUCT_CATEGORIES;

/**
 * 관리자 폼이 보낸 상품 본문을 Prisma에 넣을 수 있는 형태로 좁힌다.
 *
 * 예전에는 `await request.json()`의 결과(`any`)를 그대로 `prisma.create/update`에
 * 흘려보내서, 타입 검사가 아무것도 잡아주지 못했다. 문자열 자리에 객체가 오면
 * Prisma가 던지고 500이 나갔고, JSON 칸에 무엇이 들어가는지도 확인되지 않았다.
 *
 * POST와 PUT이 같은 규칙을 써야 하므로 한 곳에 둔다 —
 * 두 곳에 흩어져 있으면 한쪽만 고쳐져 등록과 수정의 동작이 갈린다.
 */
export function toProductData(body: Record<string, unknown>) {
  return {
    name: str(body.name),
    category: str(body.category),
    material: str(body.material),
    description: str(body.description),
    price: toPrice(body.price),
    imageAssetKey: str(body.imageAssetKey),
    imageAlt: str(body.imageAlt),
    // imageAspectRatio는 갱신하지 않는다 — 렌더에 쓰이지 않아 관리자 폼에서
    // 입력칸을 뺐고, 여기서 `?? null`로 덮으면 기존 값이 조용히 지워진다.
    imageExt: nullableStr(body.imageExt),
    // 빈 문자열은 "썸네일 없음"이다 — null로 눕혀야 화면이 대표 컷으로 대체한다.
    thumbnailAssetKey: nullableStr(body.thumbnailAssetKey),
    thumbnailAlt: nullableStr(body.thumbnailAlt),
    thumbnailExt: nullableStr(body.thumbnailExt),
    tags: jsonOr(body.tags, []),
    story: nullableStr(body.story),
    specs: jsonOrNull(body.specs),
    care: jsonOrNull(body.care),
    detail: jsonOrNull(body.detail),
  };
}

/**
 * 저장 전에 반드시 있어야 하는 값을 확인한다. 통과하면 null.
 *
 * 좁히기(toProductData)만 하면 타입이 어긋난 값이 빈 문자열로 떨어져
 * **이름 없는 상품**이 조용히 만들어진다. 관리자 폼이 required로 막고 있지만
 * API는 폼을 거치지 않고도 호출되므로 여기서도 확인한다.
 */
export function validateProductInput(body: Record<string, unknown>): string | null {
  if (!str(body.name).trim()) return "상품명을 입력해 주세요.";

  const category = str(body.category).trim();
  if (!category) return "카테고리를 선택해 주세요.";
  // 비었는지만 보던 자리다. 목록에 없는 분류로 저장된 상품은 **어디에도 걸리지
  // 않는다** — 랜딩의 컬렉션 카드도 베스트도 이 이름들과 문자열로 대조하므로,
  // 오타 하나면 등록은 성공했는데 사이트에는 나오지 않는 상품이 생긴다.
  // 관리자 폼은 select라 막히지만 API는 폼을 거치지 않고도 호출된다.
  // (예전에 폼이 "소품", 카드가 "장신구"였을 때 정확히 이 일이 났고
  //  마이그레이션으로 기존 행을 되살려야 했다 — Category.ts 주석 참고)
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return `카테고리는 ${ALLOWED_CATEGORIES.join(" · ")} 중 하나여야 합니다.`;
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableStr(value: unknown): string | null {
  const text = str(value).trim();
  return text || null;
}

/**
 * JSON 칸에 넣을 값. 객체·배열이 아니면 기본값으로 떨어뜨린다.
 *
 * 원시값(문자열·숫자)도 JSON 칼럼에는 들어가지만, 읽는 쪽(DbProductRepository)이
 * 배열이나 객체를 기대하므로 형태가 어긋나면 화면에서 조용히 사라진다.
 * 그럴 바에는 저장 단계에서 규칙을 맞춘다.
 */
function jsonOr(value: unknown, fallback: Prisma.InputJsonValue): Prisma.InputJsonValue {
  return isJsonShape(value) ? (value as Prisma.InputJsonValue) : fallback;
}

/** 값이 없으면 SQL NULL로 눕힌다(`Json?` 칼럼을 비우는 정식 방법). */
function jsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return isJsonShape(value) ? (value as Prisma.InputJsonValue) : Prisma.DbNull;
}

function isJsonShape(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}
