import Link from "next/link";
import type { Product } from "@/domain/entities/Product";
import { R2Image } from "./R2Image";

interface ProductCardProps {
  product: Product;
  /** next/image sizes — 그리드 컬럼 수에 맞춰 전달 */
  sizes?: string;
  priority?: boolean;
}

/** 상세 페이지로 연결되는 컬렉션 카드. 컬렉션 그리드와 상세 하단 추천에 공용으로 쓴다. */
export function ProductCard({
  product,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw",
  priority,
}: ProductCardProps) {
  return (
    <Link
      href={`/collection/${product.id}`}
      className="group flex h-full flex-col"
      aria-label={`${product.name} 상세 보기`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne">
        <R2Image
          image={product.image}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-[600ms] ease-silk group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-5">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">
          {product.category}
        </span>

        <h3 className="font-serif text-xl font-light text-charcoal">
          <span className="bg-gradient-to-r from-gold to-gold bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-all duration-500 ease-silk group-hover:bg-[length:100%_1px]">
            {product.name}
          </span>
        </h3>

        <span className="text-xs text-taupe">{product.material}</span>

        <p className="mt-1 flex-1 text-sm leading-relaxed text-taupe">
          {product.description}
        </p>

        <p className="pt-2 text-xs text-taupe/80">{product.tags.join(" · ")}</p>
      </div>
    </Link>
  );
}
