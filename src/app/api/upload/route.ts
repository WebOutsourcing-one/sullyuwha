import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { loadServerEnv } from "@/infrastructure/config/server-env";
import { S3AssetResolver } from "@/infrastructure/assets/S3AssetResolver";
import { requireAdmin } from "@/lib/require-admin";
import { denyCrossOrigin } from "@/lib/same-origin";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 업로드 허용 최대 크기 (10MB).
 *
 * 올리기 전 파일 크기가 아니라 **디코딩했을 때 메모리에 펼쳐지는 크기**가 상한을 정한다.
 * 10MB JPEG(약 4000×3000)은 RGBA로 약 48MB가 되고, 관리자 폼은 모델컷을
 * `Promise.all`로 최대 8장까지 동시에 올린다. 총 914Mi 인스턴스에서 이 상한을
 * 올리는 것은 곧바로 OOM 위험이다. 더 큰 원본이 필요해지면 상한을 올릴 게 아니라
 * 스왑을 붙이거나 인스턴스를 키워야 한다.
 */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * 저장할 때 줄이는 긴 변의 최대 길이.
 *
 * 상세 페이지가 가장 크게 쓰는 폭이 CSS 기준 1200px 안쪽이라, 고해상도 화면의
 * 2배수까지 덮는다. 이보다 큰 원본은 화면에서 쓰이지 않으면서 디코딩 비용만 낸다.
 */
const MAX_DIMENSION = 2400;

/** WebP 인코딩 품질. 사진 기준 82면 육안으로 원본과 구분되지 않는다. */
const WEBP_QUALITY = 82;

/**
 * 디코딩을 허용할 최대 픽셀 수 (약 40MP).
 * sharp 기본값(268MP)은 이 인스턴스에서 감당할 수 없다 — 압축률이 아주 높은
 * 파일 하나로 메모리를 통째로 가져갈 수 있어 바이트 상한만으로는 부족하다.
 */
const MAX_INPUT_PIXELS = 40_000_000;

/**
 * 변환을 한 번에 하나씩만 돌린다.
 *
 * 관리자 폼이 모델컷 8장을 동시에 올리므로, 그대로 두면 8장 분량의 디코딩 버퍼가
 * 한꺼번에 잡힌다(각 수십 MB). 순서대로 처리하면 최대 메모리가 한 장 분량으로
 * 묶이고, 8장이 걸려도 총 몇 초 늘어날 뿐이다.
 */
let transcodeQueue: Promise<unknown> = Promise.resolve();
function queueTranscode<T>(task: () => Promise<T>): Promise<T> {
  // 앞 작업이 실패해도 뒤 작업은 그대로 진행해야 한다(성공·실패 양쪽에 task를 건다).
  const run = transcodeQueue.then(task, task);
  transcodeQueue = run.catch(() => undefined);
  return run;
}

/**
 * 저장용으로 이미지를 줄이고 WebP로 다시 인코딩한다.
 *
 * 브라우저가 받는 용량은 next/image가 이미 줄여 주지만, **서버는 최적화할 때마다
 * S3 원본을 통째로 받아 디코딩한다.** 요청되는 너비마다, 캐시가 만료될 때마다 다시.
 * 원본을 작게 저장해 두면 그 비용이 근본적으로 줄어든다.
 *
 * 애니메이션(GIF·움직이는 WebP)은 손대지 않고 원본 그대로 저장한다 —
 * next/image가 애니메이션을 살려 두려고 최적화를 건너뛰는 경로라, 여기서 프레임을
 * 다시 엮으면 조용히 첫 프레임만 남는 사고가 나기 쉽다. 대신 그런 파일은 원본
 * 그대로 브라우저에 나가므로, 큰 GIF는 올리기 전에 줄여야 한다.
 *
 * @returns 저장할 바이트와 그때의 포맷
 */
async function optimizeForStorage(
  buffer: Buffer,
  format: ImageFormat,
): Promise<{ body: Buffer; format: ImageFormat }> {
  const metadata = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  if ((metadata.pages ?? 1) > 1) {
    return { body: buffer, format };
  }

  const body = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
    // 휴대폰 사진은 방향이 EXIF에만 적혀 있다. 다시 인코딩하면서 그 정보가
    // 사라지므로, 여기서 픽셀을 실제로 돌려 놓지 않으면 사진이 눕는다.
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      // 작은 원본을 굳이 늘리지 않는다. 화질은 그대로면서 용량만 커진다.
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { body, format: { mime: "image/webp", ext: "webp" } };
}

/** 실제 바이트로 판별된 이미지 포맷만 허용한다. */
type ImageFormat = { mime: string; ext: string };

/**
 * 매직 바이트로 실제 파일 포맷을 판별한다.
 * `file.type`/`file.name`은 클라이언트가 자유롭게 위조할 수 있으므로 신뢰하지 않는다.
 * 에셋은 공개 도메인(assets.sullyuwha.com)에서 서빙되므로, HTML/SVG가 섞여 들어오면
 * 그 도메인에 저장형 XSS가 생긴다. 따라서 래스터 이미지만 통과시킨다.
 */
function sniffImageFormat(buf: Buffer): ImageFormat | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" };
  }
  // GIF: "GIF87a" | "GIF89a"
  const gif = buf.subarray(0, 6).toString("latin1");
  if (gif === "GIF87a" || gif === "GIF89a") {
    return { mime: "image/gif", ext: "gif" };
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  // AVIF: .... "ftyp" + brand "avif" | "avis"
  if (buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (brand === "avif" || brand === "avis") {
      return { mime: "image/avif", ext: "avif" };
    }
  }
  return null;
}

/**
 * 버킷 키 접두사를 정규화한다.
 * 소문자/숫자/`-`/`_`/`/`만 허용해 경로 탈출(`../`)과 키 인젝션을 차단한다.
 * @returns 유효한 접두사, 형식이 어긋나면 null
 */
function sanitizePrefix(raw: string): string | null {
  const trimmed = raw.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) return null;
  if (trimmed.length > 64) return null;
  if (!/^[a-z0-9](?:[a-z0-9_-]*\/?)*[a-z0-9]$/.test(trimmed)) return null;
  if (trimmed.includes("//") || trimmed.includes("..")) return null;
  if (trimmed.split("/").length > 3) return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  // 교차 출처에서 관리자 쿠키를 태워 파일을 밀어 넣지 못하게 막는다.
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  // 관리자 세션만 업로드할 수 있다.
  // `proxy.ts`는 /sull-admin 페이지만 막으므로 API는 스스로 인증을 확인해야 한다.
  const denied = await requireAdmin();
  if (denied) return denied;

  // 인증을 통과한 뒤에 센다 — 이 제한이 막으려는 것은 **세션이 탈취된 경우**의
  // 피해 범위다. 인증 전에 세면 로그인하지 않은 외부인이 관리자 몫의 예산을
  // 대신 소진시켜 정상 업로드를 막을 수 있다.
  //
  // 모델 컷을 한 번에 8장까지 올리므로 연속 작업이 걸리지 않을 만큼은 열어 둔다.
  // 한 건이 최대 10MB를 읽고 S3에 쓰므로 상한 자체는 필요하다.
  const limited = enforceRateLimit(request, {
    name: "upload",
    perIp: 40,
    global: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const env = loadServerEnv();
  if (!env.s3AccessKey || !env.s3SecretKey) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 503 });
  }

  // 본문을 메모리로 읽기 전에 선언된 크기부터 거른다.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const rawPrefix = formData.get("prefix");
  const prefix = typeof rawPrefix === "string" ? sanitizePrefix(rawPrefix) : "uploads";
  if (!prefix) {
    return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // 확장자와 Content-Type 모두 실제 바이트에서 도출한다 — 클라이언트 입력은 쓰지 않는다.
  const sniffed = sniffImageFormat(buffer);
  if (!sniffed) {
    return NextResponse.json(
      { error: "Unsupported file type (jpeg, png, gif, webp, avif only)" },
      { status: 415 },
    );
  }

  // 저장용으로 줄여 둔다. 매직바이트 검증을 **통과한 뒤에** 디코딩한다 —
  // 순서가 바뀌면 이미지가 아닌 바이트를 sharp에 그대로 먹이게 된다.
  let body: Buffer;
  let format: ImageFormat;
  try {
    const optimized = await queueTranscode(() => optimizeForStorage(buffer, sniffed));
    body = optimized.body;
    format = optimized.format;
  } catch (error) {
    // 손상된 파일이나 상한을 넘는 해상도가 여기로 온다. 원본을 그대로 저장해
    // 넘어가지 않는다 — 그러면 줄이려던 큰 파일이 그대로 들어간다.
    console.error("[upload] 이미지 변환 실패", error);
    return NextResponse.json(
      { error: "이미지를 처리하지 못했습니다. 파일이 손상되었거나 해상도가 너무 큽니다." },
      { status: 422 },
    );
  }

  const resolver = new S3AssetResolver({
    endpoint: env.s3Endpoint ?? undefined,
    region: env.s3Region,
    accessKey: env.s3AccessKey,
    secretKey: env.s3SecretKey,
    bucket: env.s3Bucket,
    // 버킷을 다른 프로젝트와 공유하므로 이 프로젝트 파일은 전부 이 아래로 들어간다.
    keyPrefix: env.s3KeyPrefix,
    publicUrl: env.s3PublicUrl ?? `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`,
  });

  // 논리 키(`key`)와 확장자(`ext`)를 **분리해서** 돌려준다.
  //
  // 도메인은 둘을 따로 들고 URL을 `{key}.{ext}`로 조립한다
  // (R2AssetResolver.resolve, seed.ts의 "collection/dangui-subok" 관례).
  // 예전처럼 확장자가 붙은 키를 그대로 돌려주면 저장 측에서 한 번 더 붙어
  // `products/<uuid>.png.png`가 되고 이미지가 404가 된다.
  //
  // ext도 함께 돌려주는 이유 — 클라이언트가 파일명에서 뽑으면 실제 포맷과
  // 어긋난다(`photo.jpeg`라는 이름의 PNG). 여기서 판별한 값이 사실이다.
  const key = `${prefix}/${randomUUID()}`;
  const objectKey = `${key}.${format.ext}`;

  try {
    const result = await resolver.upload(body, objectKey, format.mime);
    return NextResponse.json({ key, ext: format.ext, url: result.url });
  } catch (error) {
    // 스토리지 오류 상세(버킷명·자격증명 힌트)는 클라이언트로 넘기지 않는다.
    console.error("[upload] S3 upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }
}
