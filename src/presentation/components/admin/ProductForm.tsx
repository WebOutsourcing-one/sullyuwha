"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import type { FormEvent } from "react";

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
  sortOrder: string;
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
  features?: DetailBlock[];
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
  sortOrder: "0",
};

/** 업로드된 에셋 미리보기 URL. base URL이 없으면 이미지가 없는 것으로 본다. */
const S3_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

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

/** 업로드 후 에셋 키와 확장자를 돌려준다. 실패하면 null. */
async function uploadImage(
  file: File,
): Promise<{ assetKey: string; ext: string } | null> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("prefix", "products");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    assetKey: data.key ?? data.assetKey ?? "",
    ext: file.name.split(".").pop() ?? "",
  };
}

// 정적 데이터(products.data.ts)가 쓰는 실제 분류값.
const CATEGORIES = ["여성 예복", "남성 예복", "맞춤 예복", "소품"];

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

    const body = {
      ...form,
      // 신규 상품은 서버가 ID와 정렬순서를 붙인다(자동 증가·최신순).
      // 정렬순서는 null로 보내서 서버가 "목록 맨 앞" 값을 주도록 한다.
      sortOrder: isEdit ? Number(form.sortOrder) : null,
      price: Number(form.price.replace(/,/g, "")) || 0,
      imageExt: form.imageExt || null,
      tags: safeJson(form.tags),
      specs: safeJson(form.specs),
      care: safeJson(form.care),
      detail: hasDetailContent(detail) ? detail : null,
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

      {/* ── 상단 2단 — 대표 컷(갤러리) + 상품 정보 (상세 페이지 상단과 같은 배치) ── */}
      <div className="grid gap-10 pb-16 pt-4 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="max-w-sm">
            <ImageField
              label="목록 썸네일 — 비우면 대표 컷 사용"
              value={thumbnailImage}
              onChange={setThumbnailImage}
              aspect="aspect-[4/3]"
            />
          </div>
          <div className="border-t border-neutral-200 pt-8">
            <ImageField
              label="대표 컷 — 상세 갤러리 첫 컷"
              value={coverImage}
              onChange={setCoverImage}
              aspect="aspect-[16/10]"
            />
          </div>
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
          />
        </div>
      </div>

      {/* ── 디테일 3단 — 자수·소재·안감 (상세 페이지 디테일 섹션과 같은 배치) ── */}
      <section className="border-t border-line bg-mist py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            디테일 — 자수·소재·안감
          </h2>
          <FeatureBlocks
            blocks={detail.features ?? []}
            onChange={(features) => patchDetail({ features })}
          />
        </div>
      </section>

      {/* ── 제품 정보 + 모델 컷 (상세 페이지 하단과 같은 배치) ── */}
      <div className="grid gap-10 border-t border-line py-16 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-8 rounded-xl bg-neutral-50 px-7 py-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            제품 정보
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="상품 ID">
              {isEdit ? (
                <input value={form.id} disabled className={inputCls} />
              ) : (
                <p className="rounded-lg bg-white px-3 py-2 text-sm text-neutral-500">
                  자동 생성 — product-1, product-2 …
                </p>
              )}
            </Field>
            <Field label="정렬 순서" help={isEdit ? "낮을수록 먼저 표시" : undefined}>
              {isEdit ? (
                <input type="number" value={form.sortOrder} onChange={set("sortOrder")} className={inputCls} />
              ) : (
                <p className="rounded-lg bg-white px-3 py-2 text-sm text-neutral-500">
                  자동 — 목록 맨 앞
                </p>
              )}
            </Field>
          </div>

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
}: {
  label: string;
  value: DetailImage;
  onChange: (next: DetailImage) => void;
  /** 미리보기 박스의 가로세로비 클래스. 예) aspect-[3/4], aspect-[16/10] */
  aspect?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src =
    value.assetKey && S3_BASE
      ? `${S3_BASE}/${value.assetKey}.${value.ext || "jpg"}`
      : null;

  const pick = async (file: File) => {
    setBusy(true);
    const uploaded = await uploadImage(file);
    setBusy(false);
    if (!uploaded) return alert("업로드 실패");
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
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
            alt={value.alt}
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
      <div className="mt-2">
        <input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          className={inputCls}
          placeholder="대체 텍스트"
        />
      </div>
    </div>
  );
}

/** 도메인 Image 형태(assetKey + alt + ext)를 ClickImage에 맞춰 흐르게 하는 어댑터. */
function ImageField({
  label,
  value,
  onChange,
  aspect,
}: {
  label: string;
  value: DetailImage | null | undefined;
  onChange: (image: DetailImage | null) => void;
  aspect?: string;
}) {
  const current = value ?? { assetKey: "", alt: "", ext: "" };
  return (
    <ClickImage
      label={label}
      value={current}
      aspect={aspect}
      onChange={(next) => onChange(next.assetKey || next.alt ? next : null)}
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
}: {
  label: string;
  block: DetailBlock | null;
  onChange: (block: DetailBlock | null) => void;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  imageAspect?: string;
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
}: {
  blocks: DetailBlock[];
  onChange: (blocks: DetailBlock[]) => void;
}) {
  const setItem = (i: number, next: DetailBlock) =>
    onChange(blocks.map((item, idx) => (idx === i ? next : item)));

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, i) => (
          <li key={i}>
            <div className="flex flex-col gap-3">
              <ImageField
                label={`디테일 ${i + 1} 이미지`}
                value={block.image}
                aspect="aspect-[4/3]"
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
              <button
                type="button"
                onClick={() => onChange(blocks.filter((_, idx) => idx !== i))}
                className="self-start text-xs text-red-400 hover:text-red-600"
              >
                디테일 블록 삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...blocks, { title: "", body: "" }])}
        className="mt-8 text-sm text-neutral-500 hover:text-neutral-700"
      >
        + 디테일 블록 추가
      </button>
    </div>
  );
}

/** 하단 "모델 컷" 이미지 목록. */
function ModelShots({
  shots,
  onChange,
}: {
  shots: DetailImage[];
  onChange: (shots: DetailImage[]) => void;
}) {
  return (
    <div className="space-y-6">
      {shots.map((shot, i) => (
        <ImageField
          key={i}
          label={`모델 컷 ${i + 1}`}
          value={shot}
          aspect="aspect-[3/4]"
          onChange={(next) =>
            onChange(
              next
                ? shots.map((item, idx) => (idx === i ? next : item))
                : shots.filter((_, idx) => idx !== i),
            )
          }
        />
      ))}
      {shots.length < 3 && (
        <button
          type="button"
          onClick={() => onChange([...shots, { assetKey: "", alt: "" }])}
          className="w-full rounded-lg border border-dashed border-neutral-300 py-8 text-sm text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
        >
          + 모델 컷 추가
        </button>
      )}
    </div>
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
