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
  tags: string;
  story: string;
  specs: string;
  care: string;
  sortOrder: string;
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
  tags: "[]",
  story: "",
  specs: "[]",
  care: "[]",
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

const CATEGORIES = ["dangui", "seuran-skirt", "mokhwa-dangui", "durumagi"];

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<ProductFormData>(initial ?? DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

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
    const fd = new FormData();
    fd.set("file", file);
    fd.set("prefix", "products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return alert("업로드 실패");
    const data = await res.json();
    setForm((prev) => ({
      ...prev,
      imageAssetKey: data.key ?? data.assetKey ?? "",
      imageExt: file.name.split(".").pop() ?? "",
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
            <input value={form.id} onChange={set("id")} required disabled={isEdit} className={inputCls} placeholder="예: silk-slip-dress" />
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
            <input value={form.material} onChange={set("material")} required className={inputCls} placeholder="예: 명주 100%" />
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
        <Field label="설명">
          <textarea value={form.description} onChange={set("description")} rows={3} className={inputCls} placeholder="상품에 대한 간단한 설명을 입력하세요" />
        </Field>
      </Section>

      <Section title="이미지">
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
              className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:text-neutral-700 file:transition-colors hover:file:bg-neutral-200"
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

      <Section title="상세 정보">
        <Field label="스토리" help="브랜드 스토리나 상품의 제작 배경">
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

function safeJson(val: string): unknown {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
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
              placeholder="항목명 (예: 소재, 색상, 사이즈)"
              className={`${inputCls} flex-1`}
            />
            <input
              value={item.value}
              onChange={(e) => setItem(i, "value", e.target.value)}
              placeholder="값 (예: 명주 100%, 네이비, 55-66)"
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
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
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
          placeholder="항목 입력 후 Enter"
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
