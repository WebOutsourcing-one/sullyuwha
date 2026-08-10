"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import type { FormEvent } from "react";
import { assetPreviewUrl } from "@/lib/asset-url";
import { PRODUCT_CATEGORIES } from "@/domain/entities/Category";

interface ProductFormData {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  price: string;
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string;
  /** 목록용 썸네일 — 비우면 대표 컷이 대신 나간다. */
  thumbnailAssetKey: string;
  thumbnailAlt: string;
  thumbnailExt: string;
  tags: string;
  story: string;
  specs: string;
  care: string;
  /** 상세 페이지 콘텐츠(ProductDetailContent)를 JSON 문자열로 들고 있는다. */
  detail: string;
}

/** 상세 페이지 블록에 딸린 이미지 — 도메인 Image의 관리자 입력 형태. */
interface DetailImage {
  assetKey: string;
  alt: string;
  ext?: string | null;
}

/** 이미지 + 소제목 + 본문 한 덩어리. */
interface DetailBlock {
  title: string;
  body: string;
  image?: DetailImage | null;
}

interface DetailContent {
  subtitle?: string;
  tagline?: string;
  intro?: string;
  highlight?: DetailBlock | null;
  /** null은 관리자가 비워둔 자리다. 저장 시 앞으로 당기지 않고 위치를 유지한다. */
  features?: (DetailBlock | null)[];
  modelShots?: DetailImage[];
  notes?: string[];
}

const DEFAULT_FORM: ProductFormData = {
  id: "",
  name: "",
  category: "",
  material: "",
  description: "",
  price: "0",
  imageAssetKey: "",
  imageAlt: "",
  imageExt: "",
  thumbnailAssetKey: "",
  thumbnailAlt: "",
  thumbnailExt: "",
  tags: "[]",
  story: "",
  specs: "[]",
  care: "[]",
  detail: "{}",
};

function parseJsonArray<T>(val: string): T[] {
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function parseDetail(val: string): DetailContent {
  try {
    const p = JSON.parse(val);
    return p && typeof p === "object" && !Array.isArray(p) ? (p as DetailContent) : {};
  } catch {
    return {};
  }
}

/** 입력칸을 열어만 두고 비워둔 상세 콘텐츠는 저장하지 않는다. */
function hasDetailContent(detail: DetailContent): boolean {
  return Object.values(detail).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
}

/**
 * 디테일 블록 슬롯 수.
 *
 * 상세 페이지가 3단 그리드(ProductFeatures)라 4개째부터는 줄이 어긋난다.
 * 그래서 "+ 추가"로 늘리는 대신 처음부터 3칸을 고정으로 보여주고,
 * 비어 있는 칸은 저장할 때 걸러낸다(hasFeatureContent).
 */
const FEATURE_SLOTS = 3;

/** 이미지·소제목·본문 중 하나라도 채워졌으면 저장 대상이다. */
function hasFeatureContent(block: DetailBlock): boolean {
  return Boolean(block.title?.trim() || block.body?.trim() || block.image?.assetKey);
}

/**
 * 업로드 후 에셋 키와 확장자를 돌려준다. 실패하면 null.
 *
 * 둘 다 서버 값을 그대로 쓴다 — 키에는 확장자가 붙어 있지 않고(붙으면 URL이
 * `.png.png`가 된다), 확장자는 파일명이 아니라 매직 바이트로 판별한 값이다.
 */
async function uploadImage(
  file: File,
): Promise<{ assetKey: string; ext: string } | null> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("prefix", "products");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  if (typeof data?.key !== "string" || typeof data?.ext !== "string") return null;
  return { assetKey: data.key, ext: data.ext };
}

/**
 * 이미지 대체 텍스트를 상품명과 위치에서 만든다.
 *
 * 파일명을 쓰지 않는 이유 — 파일명이 "당의-정면-자수.jpg"처럼 내용을 설명하면
 * 그게 더 정확하지만, 실제로 올라오는 이름은 IMG_4523·KakaoTalk_20260805 같은
 * 것이 대부분이다. 그런 값이 alt에 들어가면 스크린리더에 그대로 읽히고 이미지가
 * 깨졌을 때 화면에도 나간다. 무엇이 올라오든 결과를 예측할 수 있는 편이 낫다.
 *
 * 저장 시점에 다시 만든다(handleSubmit 참고). 그래서 이미지를 먼저 올리고
 * 상품명을 나중에 적어도, 나중에 상품명을 바꿔도 최종 이름이 반영된다.
 */
function altFor(productName: string, role: string): string {
  const base = productName.trim() || "상품 이미지";
  return role ? `${base} ${role}` : base;
}

const ALT_ROLE = {
  cover: "",
  thumbnail: "썸네일",
  highlight: "문양 클로즈업",
  feature: (i: number) => `디테일 ${i + 1}`,
  modelShot: (i: number) => `착용 컷 ${i + 1}`,
} as const;

// 정적 데이터(products.data.ts)가 쓰는 실제 분류값.
// 랜딩의 컬렉션 카드가 이 이름으로 상품을 찾는다 — 목록을 따로 들지 않고 한 곳에서 가져온다.
// 예전에는 여기만 "소품"이었고 카드는 "장신구"라, 소품으로 등록한 상품은 어디에도 걸리지 않았다.
const CATEGORIES = PRODUCT_CATEGORIES;

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<ProductFormData>(initial ?? DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const detail = parseDetail(form.detail);
  const setDetail = (next: DetailContent) =>
    setForm((prev) => ({ ...prev, detail: JSON.stringify(next) }));
  const patchDetail = (next: Partial<DetailContent>) =>
    setDetail({ ...detail, ...next });

  const set = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // 대표 이미지 / 썸네일 — 도메인 DetailImage 형태로 들고 폼 필드에 펼친다.
  const coverImage: DetailImage = {
    assetKey: form.imageAssetKey,
    alt: form.imageAlt,
    ext: form.imageExt,
  };
  const setCoverImage = (next: DetailImage | null) =>
    setForm((prev) => ({
      ...prev,
      imageAssetKey: next?.assetKey ?? "",
      imageAlt: next?.alt ?? "",
      imageExt: next?.ext ?? "",
    }));
  const thumbnailImage: DetailImage = {
    assetKey: form.thumbnailAssetKey,
    alt: form.thumbnailAlt,
    ext: form.thumbnailExt,
  };
  const setThumbnailImage = (next: DetailImage | null) =>
    setForm((prev) => ({
      ...prev,
      thumbnailAssetKey: next?.assetKey ?? "",
      thumbnailAlt: next?.alt ?? "",
      thumbnailExt: next?.ext ?? "",
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // alt는 저장 시점에 상품명으로 다시 만든다.
    // 업로드 때 한 번만 정하면 나중에 상품명을 바꿨을 때 옛 이름이 남고,
    // 이미지를 먼저 올리고 상품명을 나중에 적는 순서에서도 빈 이름이 굳는다.
    const withAlt = (image: DetailImage | null | undefined, role: string) =>
      image?.assetKey ? { ...image, alt: altFor(form.name, role) } : image;

    const detailWithAlt: DetailContent = {
      ...detail,
      highlight: detail.highlight
        ? { ...detail.highlight, image: withAlt(detail.highlight.image, ALT_ROLE.highlight) }
        : detail.highlight,
      // 비어 있는 칸은 null로 남긴다 — 1·3번만 채우면 상세 페이지도
      // 1·빈칸·3으로 나가야 하므로 뒤 블록을 앞으로 당기지 않는다.
      // 뒤쪽 빈 칸은 화면에 아무것도 만들지 않으므로 잘라내고,
      // 전부 비면 undefined로 둬서 JSON에 키 자체가 남지 않게 한다
      // (그래야 기존에 저장돼 있던 디테일이 실제로 지워진다).
      features: (() => {
        const slots = (detail.features ?? []).map((block, i) =>
          block && hasFeatureContent(block)
            ? { ...block, image: withAlt(block.image, ALT_ROLE.feature(i)) }
            : null,
        );
        while (slots.length > 0 && slots[slots.length - 1] === null) slots.pop();
        return slots.length > 0 ? slots : undefined;
      })(),
      modelShots: detail.modelShots?.map((shot, i) => ({
        ...shot,
        alt: altFor(form.name, ALT_ROLE.modelShot(i)),
      })),
    };

    const body = {
      ...form,
      // 순서는 보내지 않는다 — 등록 시각이 정한다. 수정해도 자리는 그대로다.
      price: Number(form.price.replace(/,/g, "")) || 0,
      imageExt: form.imageExt || null,
      imageAlt: form.imageAssetKey ? altFor(form.name, ALT_ROLE.cover) : "",
      thumbnailAlt: form.thumbnailAssetKey ? altFor(form.name, ALT_ROLE.thumbnail) : "",
      tags: safeJson(form.tags),
      specs: safeJson(form.specs),
      care: safeJson(form.care),
      detail: hasDetailContent(detailWithAlt) ? detailWithAlt : null,
    };

    const url = isEdit
      ? `/api/admin/products/${form.id}`
      : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "저장에 실패했습니다");
        return;
      }
      router.push("/sull-admin/products");
    } catch {
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light">
            {isEdit ? "상품 수정" : "새 상품 등록"}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {isEdit ? "상품 정보를 수정합니다" : "새로운 상품을 등록합니다"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/sull-admin/products")}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* ── 목록 썸네일 — 컬렉션 카드·주문 요약에만 쓰이고 상세 페이지에는 나가지 않는다.
             그래서 오른쪽 칸을 비워 둔다. 여기에 상품 정보를 끌어올리면 아래의
             대표 컷 ↔ 상품 정보 짝이 상세 페이지와 다른 높이에 놓인다. ── */}
      <div className="grid gap-10 pt-4 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-sm">
          <ImageField
            label="목록 썸네일 — 컬렉션 카드에 걸리는 컷 (비우면 대표 컷 사용)"
            value={thumbnailImage}
            onChange={setThumbnailImage}
            aspect="aspect-[4/3]"
            alt={altFor(form.name, ALT_ROLE.thumbnail)}
          />
        </div>
      </div>

      {/* ── 상단 2단 — 대표 컷(갤러리) + 상품 정보 (상세 페이지 상단과 같은 배치) ── */}
      <div className="mt-10 grid gap-10 border-t border-neutral-200 pb-16 pt-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <ImageField
            label="대표 컷 — 상세 갤러리 첫 컷"
            value={coverImage}
            onChange={setCoverImage}
            aspect="aspect-[3/4]"
            alt={altFor(form.name, ALT_ROLE.cover)}
          />
        </div>

        <div className="flex flex-col gap-5">
          <Field label="카테고리">
            <select value={form.category} onChange={set("category")} required className={inputCls}>
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="상품명">
            <input
              value={form.name}
              onChange={set("name")}
              required
              className={`${inputCls} text-xl font-light`}
              placeholder="상품명을 입력하세요"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="한자 부제">
              <input
                value={detail.subtitle ?? ""}
                onChange={(e) => patchDetail({ subtitle: e.target.value })}
                className={inputCls}
                placeholder="예: 壽福紋 唐衣"
              />
            </Field>
            <Field label="세로 태그라인">
              <input
                value={detail.tagline ?? ""}
                onChange={(e) => patchDetail({ tagline: e.target.value })}
                className={inputCls}
                placeholder="예: 수와 복을 새겨, 마음을 담다"
              />
            </Field>
          </div>
          <Field label="도입부" help="제목 아래 문단. 줄바꿈은 그대로 유지된다">
            <textarea
              value={detail.intro ?? ""}
              onChange={(e) => patchDetail({ intro: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder={"수(壽)와 복(福)을 새겨\n예를 갖추는 자리에 기품을 더합니다."}
            />
          </Field>
          <Field label="판매가 (원)" help="0이면 '가격 문의'로 표시되고 결제 버튼이 나가지 않는다">
            <input
              type="number"
              min={0}
              step={1000}
              value={form.price}
              onChange={set("price")}
              className={inputCls}
              placeholder="예: 1800000"
            />
            {Number(form.price) > 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                {Number(form.price).toLocaleString("ko-KR")}원으로 판매됩니다
              </p>
            )}
          </Field>

          {/* 상징 해설 — 대표 문양 클로즈업 + 의미 */}
          <BlockEditor
            label="상징 해설 — 대표 문양 클로즈업 + 의미"
            block={detail.highlight ?? null}
            onChange={(highlight) => patchDetail({ highlight })}
            titlePlaceholder="예: 수복문, 장수와 복의 기원"
            bodyPlaceholder="문양이 지닌 의미를 풀어 쓰세요"
            imageAspect="aspect-[16/10]"
            imageAlt={altFor(form.name, ALT_ROLE.highlight)}
          />
        </div>
      </div>

      {/* ── 디테일 3단 — 자수·소재·안감 (상세 페이지 디테일 섹션과 같은 배치) ── */}
      <section className="border-t border-line py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            디테일 — 자수·소재·안감
          </h2>
          <FeatureBlocks
            blocks={detail.features ?? []}
            onChange={(features) => patchDetail({ features })}
            productName={form.name}
          />
        </div>
      </section>

      {/* ── 제품 정보 + 모델 컷 (상세 페이지 하단과 같은 배치) ── */}
      <div className="grid gap-10 border-t border-line py-16 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-8 rounded-xl bg-neutral-50 px-7 py-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            제품 정보
          </h2>

          <SpecsInput
            values={parseJsonArray<{ label: string; value: string }>(form.specs)}
            onChange={(specs) => setForm((prev) => ({ ...prev, specs: JSON.stringify(specs) }))}
          />

          <ListInput
            label="세탁 및 관리 방법"
            values={parseJsonArray<string>(form.care)}
            onChange={(care) => setForm((prev) => ({ ...prev, care: JSON.stringify(care) }))}
          />

          <ListInput
            label="유의사항"
            values={detail.notes ?? []}
            onChange={(notes) => patchDetail({ notes })}
            placeholder="예: 모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다."
          />

          <Field label="설명" help="컬렉션 카드와 검색 결과에 나가는 한 줄 소개">
            <textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} placeholder="상품에 대한 간단한 설명을 입력하세요" />
          </Field>

          <Field label="스토리" help="상징 해설 블록을 채우면 이 글은 상세 페이지에 나가지 않는다">
            <textarea value={form.story} onChange={set("story")} rows={5} className={inputCls} placeholder="상품의 제작 스토리를 자유롭게 작성하세요" />
          </Field>

          <TagInput
            label="태그"
            values={parseJsonArray<string>(form.tags)}
            onChange={(tags) => setForm((prev) => ({ ...prev, tags: JSON.stringify(tags) }))}
          />
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            모델 컷
          </h2>
          <ModelShots
            shots={detail.modelShots ?? []}
            onChange={(modelShots) => patchDetail({ modelShots })}
            productName={form.name}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => router.push("/sull-admin/products")}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
        {help && <span className="ml-2 font-normal text-neutral-400">— {help}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none";

function safeJson(val: string): unknown {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

/** 클릭하면 파일 선택이 열리는 이미지 업로드 미리보기 박스. */
function ClickImage({
  label,
  value,
  onChange,
  aspect,
  alt,
}: {
  label: string;
  value: DetailImage;
  onChange: (next: DetailImage) => void;
  /** 미리보기 박스의 가로세로비 클래스. 예) aspect-[3/4], aspect-[16/10] */
  aspect?: string;
  /** 상품명에서 만든 대체 텍스트. 입력받지 않는다(altFor 주석 참고). */
  alt: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = assetPreviewUrl(value.assetKey, value.ext);

  const pick = async (file: File) => {
    setBusy(true);
    const uploaded = await uploadImage(file);
    setBusy(false);
    if (!uploaded) return alert("업로드 실패");
    onChange({ ...value, assetKey: uploaded.assetKey, ext: uploaded.ext, alt });
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {value.assetKey && (
          <button
            type="button"
            onClick={() => onChange({ assetKey: "", alt: "", ext: "" })}
            className="text-xs text-red-400 hover:text-red-600"
          >
            이미지 제거
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative block w-full overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-white transition-colors hover:border-neutral-400 hover:bg-neutral-50 ${aspect ?? "aspect-[4/3]"}`}
      >
        {src ? (
          <NextImage
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 40vw, 20vw"
            unoptimized={value.ext === "gif"}
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-400">
            <span className="text-lg leading-none">+</span>
            <span className="text-xs">이미지 업로드</span>
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 text-sm text-white">
            업로드 중...
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
          e.currentTarget.value = "";
        }}
      />
      {/* 입력이 아니라 확인용이다 — 저장될 alt를 눈으로 볼 수 있게만 해 둔다. */}
      {value.assetKey && (
        <p className="mt-1 truncate text-[0.7rem] text-neutral-400" title={alt}>
          대체 텍스트: {alt}
        </p>
      )}
    </div>
  );
}

/** 도메인 Image 형태(assetKey + alt + ext)를 ClickImage에 맞춰 흐르게 하는 어댑터. */
function ImageField({
  label,
  value,
  onChange,
  aspect,
  alt,
}: {
  label: string;
  value: DetailImage | null | undefined;
  onChange: (image: DetailImage | null) => void;
  aspect?: string;
  alt: string;
}) {
  const current = value ?? { assetKey: "", alt: "", ext: "" };
  return (
    <ClickImage
      label={label}
      value={current}
      aspect={aspect}
      alt={alt}
      // alt는 이제 입력받지 않으므로 이미지 유무만으로 블록 유지 여부를 정한다.
      onChange={(next) => onChange(next.assetKey ? next : null)}
    />
  );
}

/** 이미지 + 소제목 + 본문 한 블록 편집기(상징 해설용). */
function BlockEditor({
  label,
  block,
  onChange,
  titlePlaceholder,
  bodyPlaceholder,
  imageAspect,
  imageAlt,
}: {
  label: string;
  block: DetailBlock | null;
  onChange: (block: DetailBlock | null) => void;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  imageAspect?: string;
  imageAlt: string;
}) {
  const patch = (next: Partial<DetailBlock>) =>
    onChange({ title: "", body: "", ...block, ...next });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">{label}</span>
        {block?.image && (
          <button
            type="button"
            onClick={() => patch({ image: null })}
            className="text-xs text-red-400 hover:text-red-600"
          >
            블록 이미지 제거
          </button>
        )}
      </div>
      <div className="space-y-3">
        <ImageField
          label="이미지 (클릭해서 교체)"
          value={block?.image}
          aspect={imageAspect}
          alt={imageAlt}
          onChange={(image) => patch({ image })}
        />
        <input
          value={block?.title ?? ""}
          onChange={(e) => patch({ title: e.target.value })}
          className={inputCls}
          placeholder={titlePlaceholder ?? "소제목"}
        />
        <textarea
          value={block?.body ?? ""}
          onChange={(e) => patch({ body: e.target.value })}
          rows={4}
          className={inputCls}
          placeholder={bodyPlaceholder ?? "본문"}
        />
      </div>
    </div>
  );
}

/** 디테일 블록 목록 — 상세 페이지처럼 한 줄에 3단으로 놓는다. */
function FeatureBlocks({
  blocks,
  onChange,
  productName,
}: {
  /** null은 비워둔 자리다(저장 형태와 같은 모양으로 주고받는다). */
  blocks: (DetailBlock | null)[];
  onChange: (blocks: (DetailBlock | null)[]) => void;
  productName: string;
}) {
  // 상태 배열이 슬롯 수보다 짧을 수 있다(기존 상품·초기 상태). 빈 칸으로 채워 자리를 맞춘다.
  const slots: DetailBlock[] = Array.from(
    { length: FEATURE_SLOTS },
    (_, i) => blocks[i] ?? { title: "", body: "" },
  );

  const setItem = (i: number, next: DetailBlock) =>
    onChange(slots.map((item, idx) => (idx === i ? next : item)));

  /** i번째 칸을 delta칸 옮긴다. 빈 칸과도 자리를 바꾼다(빈 칸으로 밀어 넣기). */
  const move = (i: number, delta: number) => {
    const target = i + delta;
    if (target < 0 || target >= FEATURE_SLOTS) return;
    const next = [...slots];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div>
      <p className="mb-6 text-xs text-neutral-400">
        칸을 비워두면 그 자리는 상세 페이지에서도 빈 칸으로 남습니다.
        1번과 3번만 채우면 2번 자리는 비운 채 나갑니다.
      </p>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((block, i) => {
          const filled = hasFeatureContent(block);
          return (
            <li key={i}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    디테일 {i + 1}
                    {!filled && <span className="ml-1.5 text-neutral-300">— 비어 있음</span>}
                  </span>
                  {filled && (
                    <button
                      type="button"
                      onClick={() => setItem(i, { title: "", body: "", image: null })}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      비우기
                    </button>
                  )}
                </div>
                <ImageField
                  label="이미지"
                  value={block.image}
                  aspect="aspect-[4/3]"
                  alt={altFor(productName, ALT_ROLE.feature(i))}
                  onChange={(image) => setItem(i, { ...block, image })}
                />
                <input
                  value={block.title}
                  onChange={(e) => setItem(i, { ...block, title: e.target.value })}
                  className={`${inputCls} font-light`}
                  placeholder="소제목 (예: 정교한 수복문 자수)"
                />
                <textarea
                  value={block.body}
                  onChange={(e) => setItem(i, { ...block, body: e.target.value })}
                  rows={4}
                  className={inputCls}
                  placeholder="본문 — 이 디테일이 무엇을 뜻하는지 적어주세요"
                />
                <div className="flex items-center gap-1">
                  <MoveButton
                    label={`디테일 ${i + 1} 앞칸으로 옮기기`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ←
                  </MoveButton>
                  <MoveButton
                    label={`디테일 ${i + 1} 뒷칸으로 옮기기`}
                    disabled={i === FEATURE_SLOTS - 1}
                    onClick={() => move(i, 1)}
                  >
                    →
                  </MoveButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * 모델 컷 개수 상한.
 *
 * 캐러셀(ModelShotCarousel)은 개수 제약이 없지만 우측 세로 썸네일 레일이
 * 길어지면 큰 컷과 높이가 어긋난다. 화면이 감당하는 선에서 끊는다.
 */
const MAX_MODEL_SHOTS = 8;

/**
 * 하단 "모델 컷" 이미지 목록.
 *
 * 여러 장을 한 번에 고를 수 있다 — 모델 컷은 같은 촬영에서 나온 여러 컷을
 * 한꺼번에 올리는 자리라, 슬롯을 하나씩 만들고 한 장씩 넣는 방식은 품이 많이 든다.
 */
function ModelShots({
  shots,
  onChange,
  productName,
}: {
  shots: DetailImage[];
  onChange: (shots: DetailImage[]) => void;
  productName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_MODEL_SHOTS - shots.length;

  const addFiles = async (files: File[]) => {
    // 상한을 넘겨 고르면 조용히 버리지 않고 몇 장이 빠졌는지 알린다.
    const accepted = files.slice(0, remaining);
    const skipped = files.length - accepted.length;

    setBusy(true);
    // 고른 순서를 유지해야 하므로 결과를 인덱스 그대로 받는다.
    const uploaded = await Promise.all(
      accepted.map(async (file, i): Promise<DetailImage | null> => {
        const result = await uploadImage(file);
        if (!result) return null;
        return {
          assetKey: result.assetKey,
          ext: result.ext,
          // 저장할 때 어차피 다시 만들지만, 미리보기가 곧바로 맞도록 채워 둔다.
          alt: altFor(productName, ALT_ROLE.modelShot(shots.length + i)),
        };
      }),
    );
    setBusy(false);

    const added = uploaded.filter((item): item is DetailImage => item !== null);
    if (added.length > 0) onChange([...shots, ...added]);

    const failed = accepted.length - added.length;
    if (failed > 0 || skipped > 0) {
      alert(
        [
          failed > 0 ? `${failed}장 업로드에 실패했습니다.` : "",
          skipped > 0 ? `최대 ${MAX_MODEL_SHOTS}장까지라 ${skipped}장은 추가하지 않았습니다.` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  };

  /** i번째를 delta칸 옮긴다. 캐러셀이 도는 순서가 곧 이 배열 순서다. */
  const move = (i: number, delta: number) => {
    const target = i + delta;
    if (target < 0 || target >= shots.length) return;
    const next = [...shots];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {shots.map((shot, i) => (
          // 인덱스가 아니라 에셋 키로 키를 잡는다 — 순서를 바꿀 때 인덱스 키를 쓰면
          // React가 자리(위치) 기준으로 컴포넌트를 재사용해 업로드 중 상태가 엉뚱한
          // 항목에 남는다.
          <ShotThumb
            key={shot.assetKey || `empty-${i}`}
            shot={shot}
            index={i}
            alt={altFor(productName, ALT_ROLE.modelShot(i))}
            onChange={(next) =>
              onChange(
                next
                  ? shots.map((item, idx) => (idx === i ? next : item))
                  : shots.filter((_, idx) => idx !== i),
              )
            }
          />
        ))}
        {shots.length > 0 && remaining > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="h-32 w-24 rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600 disabled:opacity-50"
            title="모델 컷 추가"
          >
            {busy ? "업로드 중..." : "+"}
          </button>
        )}
      </div>

      {shots.length > 1 && (
        <button
          type="button"
          onClick={() => setReorderOpen(true)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-800"
        >
          순서 변경
        </button>
      )}

      {shots.length === 0 && (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-neutral-300 py-8 text-sm text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600 disabled:opacity-50"
        >
          {busy ? "업로드 중..." : "+ 모델 컷 추가 — 여러 장 선택 가능"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) addFiles(files);
          e.currentTarget.value = "";
        }}
      />

      {reorderOpen && (
        <ReorderDialog
          shots={shots}
          onClose={() => setReorderOpen(false)}
          onMove={move}
        />
      )}
    </div>
  );
}

/** 모델 컷 하나를 보여주는 작은 썸네일. 클릭하면 교체, X로 삭제. */
function ShotThumb({
  shot,
  index,
  alt,
  onChange,
}: {
  shot: DetailImage;
  index: number;
  alt: string;
  onChange: (next: DetailImage | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = assetPreviewUrl(shot.assetKey, shot.ext);

  const pick = async (file: File) => {
    setBusy(true);
    const uploaded = await uploadImage(file);
    setBusy(false);
    if (!uploaded) return alert("업로드 실패");
    onChange({ ...shot, assetKey: uploaded.assetKey, ext: uploaded.ext, alt });
  };

  return (
    <div className="group relative h-32 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 z-10"
        aria-label={`모델 컷 ${index + 1} 교체`}
      />
      {src && (
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes="96px"
          unoptimized={shot.ext === "gif"}
          className="object-cover"
        />
      )}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center text-lg text-neutral-400">
          +
        </div>
      )}
      {busy && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/40 text-xs text-white">
          업로드 중...
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(null);
        }}
        className="absolute right-1 top-1 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/60 text-xs leading-none text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={`모델 컷 ${index + 1} 삭제`}
      >
        &times;
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

/** 모델 컷 순서를 한눈에 보고 바꾸는 다이얼로그. 변경은 즉시 목록에 반영된다. */
function ReorderDialog({
  shots,
  onClose,
  onMove,
}: {
  shots: DetailImage[];
  onClose: () => void;
  onMove: (i: number, delta: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">모델 컷 순서</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-neutral-400 hover:text-neutral-700"
            aria-label="닫기"
          >
            &times;
          </button>
        </div>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {shots.map((shot, i) => {
            const src = assetPreviewUrl(shot.assetKey, shot.ext);
            return (
              <li
                key={shot.assetKey || `empty-${i}`}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2"
              >
                <span className="w-4 text-center text-xs tabular-nums text-neutral-400">
                  {i + 1}
                </span>
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-neutral-200">
                  {src && (
                    <NextImage
                      src={src}
                      alt={shot.alt}
                      fill
                      sizes="40px"
                      unoptimized={shot.ext === "gif"}
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="flex-1 truncate text-xs text-neutral-500">
                  모델 컷 {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <MoveButton
                    label={`모델 컷 ${i + 1} 위로`}
                    disabled={i === 0}
                    onClick={() => onMove(i, -1)}
                  >
                    ↑
                  </MoveButton>
                  <MoveButton
                    label={`모델 컷 ${i + 1} 아래로`}
                    disabled={i === shots.length - 1}
                    onClick={() => onMove(i, 1)}
                  >
                    ↓
                  </MoveButton>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

/** 순서 이동 버튼. 화살표는 장식이라 읽히지 않게 두고 label로 용도를 알린다. */
function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-neutral-200 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-800 disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:text-neutral-500"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function TagInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="태그 입력 후 Enter"
          className={inputCls}
        />
        <button type="button" onClick={add} className="shrink-0 rounded-lg bg-neutral-200 px-3 text-sm hover:bg-neutral-300">
          추가
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              {v}
              <button type="button" onClick={() => remove(i)} className="text-neutral-400 hover:text-red-500">&times;</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsInput({
  values,
  onChange,
}: {
  values: { label: string; value: string }[];
  onChange: (v: { label: string; value: string }[]) => void;
}) {
  const add = () => onChange([...values, { label: "", value: "" }]);
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const setItem = (idx: number, key: "label" | "value", val: string) =>
    onChange(values.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">상품 스펙</label>
      <div className="space-y-2">
        {values.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.label}
              onChange={(e) => setItem(i, "label", e.target.value)}
              placeholder="항목명 (예: 소재, 색상, 구성)"
              className={`${inputCls} flex-1`}
            />
            <input
              value={item.value}
              onChange={(e) => setItem(i, "value", e.target.value)}
              placeholder="값 (예: 명주 100%, 진홍, 당의·스란치마)"
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-400 hover:bg-red-50">
              삭제
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-sm text-neutral-500 hover:text-neutral-700">
          + 스펙 항목 추가
        </button>
      </div>
    </div>
  );
}

function ListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "항목 입력 후 Enter"}
          className={inputCls}
        />
        <button type="button" onClick={add} className="shrink-0 rounded-lg bg-neutral-200 px-3 text-sm hover:bg-neutral-300">
          추가
        </button>
      </div>
      {values.length > 0 && (
        <ul className="mt-2 space-y-1">
          {values.map((v, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-neutral-700">
              <span>{v}</span>
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
