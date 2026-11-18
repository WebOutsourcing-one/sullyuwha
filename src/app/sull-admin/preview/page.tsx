import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getContactCached } from "@/composition/queries";
import { ProductPreview } from "@/presentation/components/admin/ProductPreview";

export const metadata: Metadata = {
  title: "상품 미리보기 | 설유화",
  robots: { index: false, follow: false },
};

/**
 * 저장 전 상품 상세 페이지 미리보기.
 *
 * (admin) 그룹 밖에 두는 이유 — 관리자 사이드바 없이 실제 사이트와 같은 모습으로
 * 보여야 미리보기의 의미가 있다. 그래서 인증은 여기서 따로 확인한다.
 */
export default async function ProductPreviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/sull-admin/login");

  const contact = await getContactCached();
  const instagramUrl = contact.socials.find(
    (s) => s.label.toLowerCase() === "instagram",
  )?.url;

  return <ProductPreview instagramUrl={instagramUrl} />;
}
