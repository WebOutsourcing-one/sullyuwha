import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/composition/container";
import { thumbnailOf } from "@/domain/entities/Product";
import { formatKrw, isPayableKrw } from "@/domain/value-objects/Money";
import { Container } from "@/presentation/components/ui/Container";
import { R2Image } from "@/presentation/components/ui/R2Image";
import { CheckoutForm } from "@/presentation/components/checkout/CheckoutForm";
import { LoginRequired } from "@/presentation/components/checkout/LoginRequired";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ productId: string }>;
}

// 주문서를 만들고 결제위젯을 띄우는 화면이라 정적 생성 대상이 아니다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주문 · 결제 | 설유화",
  // 결제 화면이 검색 결과에 노출될 이유가 없다.
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ params }: PageProps) {
  const { productId } = await params;
  const [product, session] = await Promise.all([
    container.getProduct.execute(productId),
    auth(),
  ]);

  if (!product) notFound();

  const purchasable = isPayableKrw(product.price);
  const userId = session?.user?.id;

  return (
    <Container className="pb-24 pt-10 md:pt-14">
      <nav className="flex items-center gap-2 text-xs text-taupe" aria-label="위치">
        <Link href="/" className="transition-colors hover:text-charcoal">
          홈
        </Link>
        <span aria-hidden className="text-line">
          /
        </span>
        <Link
          href={`/collection/${product.id}`}
          className="transition-colors hover:text-charcoal"
        >
          {product.name}
        </Link>
        <span aria-hidden className="text-line">
          /
        </span>
        <span className="text-charcoal/70">주문</span>
      </nav>

      <h1 className="mt-6 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">주문 · 결제</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div className="order-2 lg:order-1">
          {!purchasable ? (
            <div className="flex flex-col items-start gap-5 border border-line bg-mist/50 px-6 py-8">
              <p className="text-sm leading-relaxed text-taupe">
                이 품목은 아직 판매가가 책정되지 않았습니다. 맞춤 제작 상담을 통해
                구성과 금액을 안내해 드립니다.
              </p>
              <Link
                href="/#contact"
                className="rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold"
              >
                구매 문의
              </Link>
            </div>
          ) : userId ? (
            <CheckoutForm
              productId={product.id}
              unitPrice={product.price}
              defaultName={session?.user?.name ?? ""}
              defaultEmail={session?.user?.email ?? ""}
            />
          ) : (
            <LoginRequired callbackUrl={`/checkout/${product.id}`} />
          )}
        </div>

        {/* 주문 요약 */}
        <aside className="order-1 self-start lg:order-2 lg:sticky lg:top-28">
          <div className="border border-line bg-mist/40 p-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold">주문 상품</h2>
            <div className="mt-5 flex gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-champagne">
                <R2Image image={thumbnailOf(product)} sizes="80px" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">
                  {product.category}
                </span>
                <span className="font-serif text-lg font-light leading-snug text-charcoal">
                  {product.name}
                </span>
                <span className="text-xs text-taupe">{product.material}</span>
                <span className="mt-1 text-sm text-charcoal">
                  {purchasable ? formatKrw(product.price) : "가격 문의"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
