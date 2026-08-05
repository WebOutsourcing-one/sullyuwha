import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { loadServerEnv } from "@/infrastructure/config/server-env";
import { S3AssetResolver } from "@/infrastructure/assets/S3AssetResolver";
import { requireAdmin } from "@/lib/require-admin";
import { denyCrossOrigin } from "@/lib/same-origin";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 업로드 허용 최대 크기 (10MB). */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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
  const format = sniffImageFormat(buffer);
  if (!format) {
    return NextResponse.json(
      { error: "Unsupported file type (jpeg, png, gif, webp, avif only)" },
      { status: 415 },
    );
  }

  const resolver = new S3AssetResolver({
    endpoint: env.s3Endpoint ?? undefined,
    region: env.s3Region,
    accessKey: env.s3AccessKey,
    secretKey: env.s3SecretKey,
    bucket: env.s3Bucket,
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
    const result = await resolver.upload(buffer, objectKey, format.mime);
    return NextResponse.json({ key, ext: format.ext, url: result.url });
  } catch (error) {
    // 스토리지 오류 상세(버킷명·자격증명 힌트)는 클라이언트로 넘기지 않는다.
    console.error("[upload] S3 upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }
}
