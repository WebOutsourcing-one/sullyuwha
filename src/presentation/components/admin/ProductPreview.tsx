"use client";

import { useSyncExternalStore } from "react";
import { ProductDetail } from "@/presentation/components/sections/ProductDetail";
import {
  PREVIEW_STORAGE_KEY,
  previewToProduct,
  type ProductPreviewPayload,
} from "./previewPayload";

function subscribe(onChange: () => void) {
  // 다른 탭(관리자 폼)에서 값을 바꾸면 storage 이벤트가 온다.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * 저장 전 상품을 실제 상세 페이지 컴포넌트(ProductDetail)로 그린다.
 * 관리자 폼에서 입력을 바꾸면 이 탭이 실시간으로 따라 바뀐다.
 */
export function ProductPreview({ instagramUrl }: { instagramUrl?: string }) {
  // 서버 렌더에서는 localStorage가 없으므로 "불러오는 중"으로 시작한다.
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);

  if (raw === undefined) {
    return <PreviewNotice>미리보기를 불러오는 중…</PreviewNotice>;
  }

  let payload: ProductPreviewPayload | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as ProductPreviewPayload) : null;
  } catch {
    payload = null;
  }
  if (!payload) {
    return (
      <PreviewNotice>
        미리볼 내용이 없습니다. 상품 등록·수정 화면에서 <b>미리보기</b> 버튼을 눌러 주세요.
      </PreviewNotice>
    );
  }

  const product = previewToProduct(payload);
  const missing = [
    !payload.name.trim() && "상품명",
    !payload.category && "카테고리",
    !payload.imageAssetKey && "대표 컷",
  ].filter(Boolean);

  return (
    <>
      <div className="sticky top-0 z-50 bg-neutral-900 px-4 py-2.5 text-center text-sm text-white">
        <b className="font-semibold">미리보기</b>
        <span className="ml-2 text-white/70">
          아직 저장되지 않은 화면입니다. 폼을 고치면 이 탭도 바로 바뀝니다.
        </span>
        {missing.length > 0 && (
          <span className="ml-2 text-amber-300">미입력: {missing.join(", ")}</span>
        )}
      </div>
      <ProductDetail product={product} related={[]} prev={null} next={null} instagramUrl={instagramUrl} />
    </>
  );
}

function PreviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-neutral-500">
      <p>{children}</p>
    </div>
  );
}
