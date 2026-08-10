/**
 * 쓰이지 않는 상품 이미지를 S3에서 지운다.
 *
 * 업로드는 파일을 고른 즉시 S3에 올라간다(미리보기를 바로 보여주기 위해서다).
 * 저장·삭제 시점의 정리는 라우트가 하지만(`src/lib/product-assets.ts`),
 * **등록하다 취소하거나 뒤로 가면 서버는 그 사실을 알 방법이 없다.**
 * 그렇게 남은 것을 주기적으로 걷어내는 것이 이 스크립트다.
 *
 * 실행 (서버):
 *   docker compose -f docker-compose.prod.yml --env-file .env.production \
 *     run --rm --no-deps app bun scripts/prune-assets.ts --apply
 *
 * `--apply` 가 없으면 **지우지 않고 목록만 보여준다.** 손으로 돌릴 때 실수로
 * 지우는 일이 없도록 기본값을 그렇게 뒀다. 크론에는 --apply 를 붙인다.
 *
 * 크론 등록은 docs/deploy.md 참고.
 */
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** 관리자 업로드가 만드는 키의 접두사. `/api/upload` 의 prefix 와 짝이다. */
const UPLOAD_PREFIX = "products/";

/**
 * 이 시간이 지나지 않은 객체는 건드리지 않는다.
 *
 * 지금 이 순간 상품을 작성 중인 관리자가 있을 수 있다. 이미지는 이미 올라갔지만
 * 아직 저장 전이라 DB 어디에도 없다 — 유예가 없으면 작성 중인 폼의 사진을 지운다.
 */
const GRACE_HOURS = 24;

/** 한 번에 지울 수 있는 객체 수 (S3 DeleteObjects 상한). */
const DELETE_BATCH = 1000;

/**
 * 훑은 객체 중 이 비율을 넘게 지우려 하면 멈춘다.
 *
 * 가장 위험한 사고는 **엉뚱한 DB를 가리킨 채 돌리는 것**이다. 참조 목록이 비거나
 * 거의 비면 살아 있는 이미지가 전부 고아로 보이고, 그대로 진행하면 상품 사진을
 * 통째로 지운다. 정상적인 정리라면 취소된 업로드 몇 개가 전부라 이 비율에
 * 닿지 않는다. 정말로 대량 정리가 필요하면 --force 로 넘긴다.
 */
const ORPHAN_RATIO_GUARD = 0.5;

function env(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} 가 설정되어 있지 않습니다.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 상세 콘텐츠(JSON) 안에 흩어져 있는 이미지 키까지 훑는다. */
function collectDetailKeys(detail: unknown, into: Set<string>): void {
  if (!isRecord(detail)) return;

  const add = (raw: unknown) => {
    if (isRecord(raw) && typeof raw.assetKey === "string" && raw.assetKey.trim()) {
      into.add(raw.assetKey.trim());
    }
  };

  if (isRecord(detail.highlight)) add(detail.highlight.image);
  if (Array.isArray(detail.features)) {
    for (const block of detail.features) if (isRecord(block)) add(block.image);
  }
  if (Array.isArray(detail.modelShots)) for (const shot of detail.modelShots) add(shot);
}

/** DB가 참조하는 모든 에셋 키(확장자 없는 논리 키). */
async function referencedKeys(prisma: PrismaClient): Promise<Set<string>> {
  const keys = new Set<string>();

  const products = await prisma.product.findMany({
    select: {
      imageAssetKey: true,
      thumbnailAssetKey: true,
      detail: true,
      images: { select: { assetKey: true } },
    },
  });

  for (const product of products) {
    if (product.imageAssetKey) keys.add(product.imageAssetKey);
    if (product.thumbnailAssetKey) keys.add(product.thumbnailAssetKey);
    for (const image of product.images) keys.add(image.assetKey);
    collectDetailKeys(product.detail, keys);
  }

  // 상품 외에도 같은 접두사를 쓰는 화면이 생길 수 있다. 지금은 상품뿐이지만,
  // 새 화면을 추가하면서 여기를 빠뜨리면 그 화면의 이미지가 조용히 지워진다.
  console.log(`  DB 참조: 상품 ${products.length}건, 키 ${keys.size}개`);
  return keys;
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const bucket = env("S3_BUCKET");
  const keyPrefix = process.env.S3_KEY_PREFIX?.replace(/^\/+|\/+$/g, "") ?? "";
  const storagePrefix = keyPrefix ? `${keyPrefix}/${UPLOAD_PREFIX}` : UPLOAD_PREFIX;

  console.log(`▸ 대상: s3://${bucket}/${storagePrefix}`);
  console.log(`  모드: ${apply ? "삭제" : "목록만 (--apply 를 붙이면 삭제)"}`);

  const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });
  const prisma = new PrismaClient({ adapter });

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION ?? "ap-northeast-2",
    credentials: { accessKeyId: env("S3_ACCESS_KEY"), secretAccessKey: env("S3_SECRET_KEY") },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });

  try {
    // DB를 먼저 읽는다. 여기서 실패하면 참조 목록이 비어 "전부 고아"로 보이고,
    // 그대로 진행하면 살아 있는 이미지를 통째로 지운다.
    const referenced = await referencedKeys(prisma);

    const cutoff = Date.now() - GRACE_HOURS * 60 * 60 * 1000;
    const orphans: string[] = [];
    let scanned = 0;
    let tooNew = 0;
    let token: string | undefined;

    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: storagePrefix,
          ContinuationToken: token,
        }),
      );

      for (const object of page.Contents ?? []) {
        if (!object.Key) continue;
        scanned += 1;

        if ((object.LastModified?.getTime() ?? 0) > cutoff) {
          tooNew += 1;
          continue;
        }

        // 저장소 키에서 접두사와 확장자를 떼어 DB의 논리 키 형태로 되돌린다.
        const withoutPrefix = keyPrefix ? object.Key.slice(keyPrefix.length + 1) : object.Key;
        const logicalKey = withoutPrefix.replace(/\.[^./]+$/, "");
        if (!referenced.has(logicalKey)) orphans.push(object.Key);
      }

      token = page.NextContinuationToken;
    } while (token);

    console.log(`  훑음 ${scanned}개 · 유예 중 ${tooNew}개 · 미참조 ${orphans.length}개`);
    for (const key of orphans) console.log(`    - ${key}`);

    if (orphans.length === 0) {
      console.log("✅ 지울 것이 없습니다.");
      return;
    }
    if (!apply) {
      console.log("ℹ️  목록만 보여줬습니다. 실제로 지우려면 --apply 를 붙이세요.");
      return;
    }

    const ratio = scanned > 0 ? orphans.length / scanned : 0;
    if (ratio > ORPHAN_RATIO_GUARD && !process.argv.includes("--force")) {
      console.error(
        `\n🚨 훑은 ${scanned}개 중 ${orphans.length}개(${Math.round(ratio * 100)}%)를 지우려 합니다.`,
      );
      console.error("   엉뚱한 DB를 가리키고 있을 가능성이 높습니다 — DATABASE_URL 을 확인하세요.");
      console.error("   정말로 대량 정리가 맞으면 --force 를 붙이세요.");
      process.exit(1);
    }

    for (let i = 0; i < orphans.length; i += DELETE_BATCH) {
      const batch = orphans.slice(i, i + DELETE_BATCH);
      const result = await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      for (const error of result.Errors ?? []) {
        console.error(`  ✗ ${error.Key}: ${error.Message}`);
      }
    }

    console.log(`✅ ${orphans.length}개 삭제 완료.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[prune-assets] 실패:", error);
  process.exit(1);
});
