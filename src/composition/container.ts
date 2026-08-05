import { StaticProductRepository } from "@/infrastructure/repositories/StaticProductRepository";
import { StaticGalleryRepository } from "@/infrastructure/repositories/StaticGalleryRepository";
import { StaticBrandContentRepository } from "@/infrastructure/repositories/StaticBrandContentRepository";
import { DbProductRepository } from "@/infrastructure/repositories/DbProductRepository";
import { DbGalleryRepository } from "@/infrastructure/repositories/DbGalleryRepository";
import { DbBrandContentRepository } from "@/infrastructure/repositories/DbBrandContentRepository";
import { GetHeroContent } from "@/application/use-cases/GetHeroContent";
import { GetBrandStory } from "@/application/use-cases/GetBrandStory";
import { GetCollection } from "@/application/use-cases/GetCollection";
import { GetProduct } from "@/application/use-cases/GetProduct";
import { GetSilkFeatures } from "@/application/use-cases/GetSilkFeatures";
import { GetGallery } from "@/application/use-cases/GetGallery";
import { GetContactInfo } from "@/application/use-cases/GetContactInfo";
import { DbOrderRepository } from "@/infrastructure/repositories/DbOrderRepository";
import { PlaceOrder } from "@/application/use-cases/PlaceOrder";
import { ConfirmPayment, SyncPaymentStatus } from "@/application/use-cases/ConfirmPayment";
import { CancelPayment } from "@/application/use-cases/CancelPayment";
import {
  GetMyOrder,
  GetMyOrders,
  GetOrder,
  ListOrders,
} from "@/application/use-cases/ListOrders";
import { getAssetResolver } from "./assets.server";

/**
 * 상품·브랜드 콘텐츠를 어디서 읽을지 정한다.
 *
 * 기본값이 `DATABASE_URL` 유무를 따라간다 — DB를 붙였다는 것은 관리자 화면으로
 * 상품을 관리하겠다는 뜻이기 때문이다. 예전에는 `DATA_SOURCE=database`를 따로
 * 켜야만 해서, 그걸 빠뜨리면 **관리자가 등록한 상품이 고객 화면에 영영 안 나왔다.**
 * 관리자 화면에는 보이는데 사이트에는 없으니 원인을 찾기 어려운 상태였다.
 *
 * `DATA_SOURCE`를 명시하면 그 값이 이긴다 — DB를 붙인 채로 정적 데이터를 보고
 * 싶을 때(디자인 작업 등) 쓴다.
 *
 *   DATA_SOURCE=database  -> 항상 DB
 *   DATA_SOURCE=static    -> 항상 정적 데이터
 *   미지정 + DATABASE_URL -> DB
 *   미지정 + DB 없음      -> 정적 데이터 (로컬에서 DB 없이 UI만 볼 때)
 */
const useDatabase = process.env.DATA_SOURCE
  ? process.env.DATA_SOURCE === "database"
  : Boolean(process.env.DATABASE_URL);

function createContainer() {
  // 어느 쪽으로 떴는지 로그로 남긴다 — "관리자에서 등록했는데 사이트에 없다"의
  // 원인이 대부분 여기라, 기동 로그만 보고도 판별할 수 있어야 한다.
  console.info(
    `[data] 상품·콘텐츠 출처: ${useDatabase ? "데이터베이스" : "정적 데이터(관리자 등록분이 보이지 않음)"}`,
  );

  const productRepository = useDatabase
    ? new DbProductRepository()
    : new StaticProductRepository();
  const galleryRepository = useDatabase
    ? new DbGalleryRepository()
    : new StaticGalleryRepository();
  const brandContentRepository = useDatabase
    ? new DbBrandContentRepository(getAssetResolver())
    : new StaticBrandContentRepository();

  // 주문은 정적 구현이 성립하지 않는다(어딘가에 남아야 하므로) — 항상 DB를 쓴다.
  // DATA_SOURCE가 database가 아니면 상품 가격이 0인 정적 데이터라
  // PlaceOrder가 "가격 미정"으로 먼저 막는다.
  const orderRepository = new DbOrderRepository();

  return {
    getHero: new GetHeroContent(brandContentRepository),
    getStory: new GetBrandStory(brandContentRepository),
    getCollection: new GetCollection(productRepository),
    getProduct: new GetProduct(productRepository),
    getSilkFeatures: new GetSilkFeatures(brandContentRepository),
    getGallery: new GetGallery(galleryRepository),
    getContact: new GetContactInfo(brandContentRepository),

    placeOrder: new PlaceOrder(productRepository, orderRepository),
    confirmPayment: new ConfirmPayment(orderRepository),
    syncPaymentStatus: new SyncPaymentStatus(orderRepository),
    cancelPayment: new CancelPayment(orderRepository),
    listOrders: new ListOrders(orderRepository),
    getOrder: new GetOrder(orderRepository),
    getMyOrders: new GetMyOrders(orderRepository),
    getMyOrder: new GetMyOrder(orderRepository),
  } as const;
}

export const container = createContainer();
export type Container = ReturnType<typeof createContainer>;
