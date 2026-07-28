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

const useDatabase = process.env.DATA_SOURCE === "database";

function createContainer() {
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
