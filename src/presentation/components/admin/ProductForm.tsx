"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      ...form,
      sortOrder: Number(form.sortOrder),
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
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.push("/sull-admin/products");
    } catch {
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const uploaded = await uploadImage(file);
    if (!uploaded) return alert("업로드 실패");
    setForm((prev) => ({
      ...prev,
      imageAssetKey: uploaded.assetKey,
      imageExt: uploaded.ext,
    }));
  };

  const handleThumbnailUpload = async (file: File) => {
    const uploaded = await uploadImage(file);
    if (!uploaded) return alert("업로드 실패");
    setForm((prev) => ({
      ...prev,
      thumbnailAssetKey: uploaded.assetKey,
      thumbnailExt: uploaded.ext,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
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

      <Section title="기본 정보">
        <div className="grid grid-cols-2 gap-4">
          <Field label="상품 ID" help="URL에 사용될 고유 식별자 (영문, 숫자, 하이픈)">
            <input value={form.id} onChange={set("id")} required disabled={isEdit} className={inputCls} placeholder="예: dangui-bonghwang" />
          </Field>
          <Field label="정렬 순서" help="낮을수록 먼저 표시">
            <input type="number" value={form.sortOrder} onChange={set("sortOrder")} className={inputCls} />
          </Field>
        </div>
        <Field label="상품명">
          <input value={form.name} onChange={set("name")} required className={inputCls} placeholder="상품명을 입력하세요" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="카테고리">
            <select value={form.category} onChange={set("category")} required className={inputCls}>
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="소재">
            <input value={form.material} onChange={set("material")} required className={inputCls} placeholder="예: 본견(명주) · 부금(금사) 자수" />
          </Field>
        </div>
        <Field
          label="판매가 (원)"
          help="0이면 '가격 문의'로 표시되고 결제 버튼이 나가지 않는다"
        >
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
        <Field label="설명" help="컬렉션 카드와 검색 결과에 나가는 한 줄 소개">
          <textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} placeholder="상품에 대한 간단한 설명을 입력하세요" />
        </Field>
      </Section>

      <Section title="대표 이미지">
        <p className="-mt-2 text-xs leading-relaxed text-neutral-400">
          상세 페이지 갤러리의 첫 컷입니다. 목록에 걸리는 썸네일은 아래에서 따로 지정합니다.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">새 이미지 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className={fileCls}
            />
            {form.imageAssetKey && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                업로드 완료
              </div>
            )}
          </div>
          <Field label="에셋 키 (업로드 시 자동 입력)">
            <input value={form.imageAssetKey} onChange={set("imageAssetKey")} className={inputCls} />
          </Field>
        </div>
        {/* 가로세로비 입력은 제거했다 — R2Image가 next/image의 fill로 렌더하고
            잘리는 비율은 배치한 컨테이너(3:4 등)가 정하므로, 이 값은 어디서도
            쓰이지 않는 채 입력만 받고 있었다. */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="대체 텍스트">
            <input value={form.imageAlt} onChange={set("imageAlt")} className={inputCls} placeholder="이미지 설명" />
          </Field>
          <Field label="확장자">
            <input value={form.imageExt} onChange={set("imageExt")} className={inputCls} placeholder="jpg/png/gif" />
          </Field>
        </div>
      </Section>

      <Section title="목록 썸네일">
        <p className="-mt-2 text-xs leading-relaxed text-neutral-400">
          메인·컬렉션 목록과 주문 요약에 걸리는 컷입니다(3:4). 비워두면 대표 이미지가 대신 나갑니다.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">썸네일 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailUpload(file);
              }}
              className={fileCls}
            />
            {form.thumbnailAssetKey && (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnailAssetKey: "",
                    thumbnailAlt: "",
                    thumbnailExt: "",
                  }))
                }
                className="mt-2 text-xs text-red-400 hover:text-red-600"
              >
                썸네일 지우고 대표 이미지 쓰기
              </button>
            )}
          </div>
          <Field label="에셋 키 (업로드 시 자동 입력)">
            <input value={form.thumbnailAssetKey} onChange={set("thumbnailAssetKey")} className={inputCls} placeholder="예: collection/dangui-bonghwang-thumb" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="대체 텍스트">
            <input value={form.thumbnailAlt} onChange={set("thumbnailAlt")} className={inputCls} placeholder="비우면 대표 이미지의 설명을 쓴다" />
          </Field>
          <Field label="확장자">
            <input value={form.thumbnailExt} onChange={set("thumbnailExt")} className={inputCls} placeholder="jpg/png/gif" />
          </Field>
        </div>
      </Section>

      <Section title="상세 정보">
        <Field label="스토리" help="상징 해설 블록을 채우면 이 글은 상세 페이지에 나가지 않는다">
          <textarea value={form.story} onChange={set("story")} rows={5} className={inputCls} placeholder="상품의 제작 스토리를 자유롭게 작성하세요" />
        </Field>
        <SpecsInput
          values={parseJsonArray<{ label: string; value: string }>(form.specs)}
          onChange={(specs) => setForm((prev) => ({ ...prev, specs: JSON.stringify(specs) }))}
        />
        <TagInput
          label="태그"
          values={parseJsonArray<string>(form.tags)}
          onChange={(tags) => setForm((prev) => ({ ...prev, tags: JSON.stringify(tags) }))}
        />
      </Section>

      <Section title="상세 페이지 구성">
        <p className="-mt-2 text-xs leading-relaxed text-neutral-400">
          디자이너 시안 구조입니다. 채운 블록만 상세 페이지에 나가고, 비워두면 그 구간은 통째로 생략됩니다.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="한자 부제" help="제품명 아래 한 줄">
            <input
              value={detail.subtitle ?? ""}
              onChange={(e) => patchDetail({ subtitle: e.target.value })}
              className={inputCls}
              placeholder="예: 鳳凰紋 負衿 唐衣"
            />
          </Field>
          <Field label="세로 태그라인" help="대표 컷 왼쪽에 세로쓰기로 흐른다">
            <input
              value={detail.tagline ?? ""}
              onChange={(e) => patchDetail({ tagline: e.target.value })}
              className={inputCls}
              placeholder="예: 귀한 순간을 더 빛나게 하는 품격의 예복"
            />
          </Field>
        </div>

        <Field label="도입부" help="제목 아래 문단. 줄바꿈은 그대로 유지된다">
          <textarea
            value={detail.intro ?? ""}
            onChange={(e) => patchDetail({ intro: e.target.value })}
            rows={3}
            className={inputCls}
            placeholder={"봉황의 고귀함을 수놓아\n왕비의 기품과 품위를 담은 예복입니다."}
          />
        </Field>

        <BlockEditor
          label="상징 해설 — 대표 문양 클로즈업 + 의미"
          block={detail.highlight ?? null}
          onChange={(highlight) => patchDetail({ highlight })}
          titlePlaceholder="예: 봉황, 고귀함과 영원의 상징"
          bodyPlaceholder="문양이 지닌 의미를 풀어 쓰세요"
        />

        <FeatureBlocks
          blocks={detail.features ?? []}
          onChange={(features) => patchDetail({ features })}
        />

        <ModelShots
          shots={detail.modelShots ?? []}
          onChange={(modelShots) => patchDetail({ modelShots })}
        />

        <ListInput
          label="유의사항"
          values={detail.notes ?? []}
          onChange={(notes) => patchDetail({ notes })}
          placeholder="예: 모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다."
        />
      </Section>

      <Section title="관리 정보">
        <ListInput
          label="세탁 및 관리 방법"
          values={parseJsonArray<string>(form.care)}
          onChange={(care) => setForm((prev) => ({ ...prev, care: JSON.stringify(care) }))}
        />
      </Section>

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-6">
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-5 text-xs font-semibold tracking-widest text-neutral-400 uppercase">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
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

const fileCls =
  "w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:text-neutral-700 file:transition-colors hover:file:bg-neutral-200";

function safeJson(val: string): unknown {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

/** 업로드 + 에셋 키·대체 텍스트를 함께 다루는 이미지 입력칸. */
function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DetailImage | null | undefined;
  onChange: (image: DetailImage | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const patch = (next: Partial<DetailImage>) =>
    onChange({ assetKey: "", alt: "", ...value, ...next });

  const pick = async (file: File) => {
    setBusy(true);
    const uploaded = await uploadImage(file);
    setBusy(false);
    if (!uploaded) return alert("업로드 실패");
    patch({ assetKey: uploaded.assetKey, ext: uploaded.ext });
  };

  return (
    <div className="rounded-lg border border-dashed border-neutral-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {value?.assetKey && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            이미지 제거
          </button>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
        }}
        className={fileCls}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input
          value={value?.assetKey ?? ""}
          onChange={(e) => patch({ assetKey: e.target.value })}
          className={inputCls}
          placeholder="에셋 키 (예: collection/dangui-bonghwang-subok)"
        />
        <input
          value={value?.alt ?? ""}
          onChange={(e) => patch({ alt: e.target.value })}
          className={inputCls}
          placeholder="대체 텍스트"
        />
      </div>
      {busy && <p className="mt-1 text-xs text-neutral-400">업로드 중...</p>}
    </div>
  );
}

/** 이미지 + 소제목 + 본문 한 블록 편집기. */
function BlockEditor({
  label,
  block,
  onChange,
  titlePlaceholder,
  bodyPlaceholder,
  onRemove,
}: {
  label: string;
  block: DetailBlock | null;
  onChange: (block: DetailBlock | null) => void;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  onRemove?: () => void;
}) {
  const patch = (next: Partial<DetailBlock>) =>
    onChange({ title: "", body: "", ...block, ...next });

  return (
    <div className="rounded-lg bg-neutral-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600"
          >
            블록 삭제
          </button>
        )}
      </div>
      <div className="space-y-2">
        <input
          value={block?.title ?? ""}
          onChange={(e) => patch({ title: e.target.value })}
          className={inputCls}
          placeholder={titlePlaceholder ?? "소제목"}
        />
        <textarea
          value={block?.body ?? ""}
          onChange={(e) => patch({ body: e.target.value })}
          rows={3}
          className={inputCls}
          placeholder={bodyPlaceholder ?? "본문"}
        />
        <ImageField
          label="블록 이미지"
          value={block?.image}
          onChange={(image) => patch({ image })}
        />
      </div>
    </div>
  );
}

/** 디테일 블록 목록(시안은 자수·자수·안감 3단). */
function FeatureBlocks({
  blocks,
  onChange,
}: {
  blocks: DetailBlock[];
  onChange: (blocks: DetailBlock[]) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">
        디테일 블록
        <span className="ml-2 font-normal text-neutral-400">
          — 자수·소재·안감처럼 가까이서 보여줄 요소 (3개 권장)
        </span>
      </label>
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <BlockEditor
            key={i}
            label={`디테일 ${i + 1}`}
            block={block}
            titlePlaceholder="예: 정교한 수복문 자수"
            bodyPlaceholder="이 디테일이 무엇을 뜻하는지 적어주세요"
            onChange={(next) =>
              onChange(
                blocks.map((item, idx) =>
                  idx === i ? (next ?? { title: "", body: "" }) : item,
                ),
              )
            }
            onRemove={() => onChange(blocks.filter((_, idx) => idx !== i))}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange([...blocks, { title: "", body: "" }])}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          + 디테일 블록 추가
        </button>
      </div>
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
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">
        모델 컷
        <span className="ml-2 font-normal text-neutral-400">
          — 상세 페이지 하단에 나란히 놓인다 (3장 권장)
        </span>
      </label>
      <div className="space-y-2">
        {shots.map((shot, i) => (
          <ImageField
            key={i}
            label={`모델 컷 ${i + 1}`}
            value={shot}
            onChange={(next) =>
              onChange(
                next
                  ? shots.map((item, idx) => (idx === i ? next : item))
                  : shots.filter((_, idx) => idx !== i),
              )
            }
          />
        ))}
        <button
          type="button"
          onClick={() => onChange([...shots, { assetKey: "", alt: "" }])}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          + 모델 컷 추가
        </button>
      </div>
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
            <li key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              <span>{v}</span>
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
