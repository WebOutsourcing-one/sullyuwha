-- 베스트 컬렉션 지정(is_best) + 등록 시각(created_at)

ALTER TABLE "product" ADD COLUMN "is_best" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 기존 행 백필.
--
-- 지금까지 "최신순"은 등록할 때 sort_order 에 (최솟값 - 1) 을 주는 방식이었다.
-- 즉 sort_order 오름차순이 곧 최신순이다. 그 순서를 그대로 옮겨 심는다.
-- 전부 같은 시각으로 두면 최신순 정렬이 사실상 무작위가 되어,
-- 이미 배치된 컬렉션 순서가 마이그레이션만으로 뒤집힌다.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "sort_order" ASC, "id" ASC) AS rn
  FROM "product"
)
UPDATE "product" p
SET "created_at" = CURRENT_TIMESTAMP - (ordered.rn * INTERVAL '1 second')
FROM ordered
WHERE p."id" = ordered.id;

-- 분류 이름을 랜딩 카드와 맞춘다.
--
-- 관리자 폼은 "소품", 랜딩의 컬렉션 카드는 "장신구"로 서로 달랐다.
-- 이제 카드가 그 분류의 최신 상품을 물어오므로, 이름이 어긋나면
-- "소품"으로 등록한 상품이 어느 카드에도 걸리지 않는다.
UPDATE "product" SET "category" = '장신구' WHERE "category" = '소품';

-- 카테고리당 베스트는 하나뿐이라는 규칙을 DB가 강제한다.
--
-- 애플리케이션 트랜잭션만으로 막으면 토글 요청이 동시에 들어왔을 때
-- 둘 다 "기존 베스트 없음"을 읽고 각자 true 를 써서 한 카테고리에 베스트가 둘 생긴다.
-- 부분 인덱스라 is_best = false 인 행끼리는 카테고리가 겹쳐도 상관없다.
--
-- schema.prisma 는 부분 인덱스를 표현하지 못해 이 인덱스를 모른다.
-- 마이그레이션 히스토리에는 남으므로 drift 로 잡히지는 않지만,
-- `prisma db push` 로 스키마를 밀면 만들어지지 않는다는 점만 유의한다.
CREATE UNIQUE INDEX "product_one_best_per_category"
  ON "product" ("category")
  WHERE "is_best";

-- 카테고리별 최신 상품 조회용(랜딩 컬렉션 카드).
CREATE INDEX "product_category_created_at_idx" ON "product" ("category", "created_at");
