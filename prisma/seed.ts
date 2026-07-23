import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("🌱 Seeding database...");

  // Hero
  await prisma.heroContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      eyebrow: "SULLYUWHA — KOREAN COUTURE HANBOK",
      slogan: "고귀함이 서려있는\n기품있는 선",
      subcopy: "전통의 아름다움 위에\n현대의 감각을 더해\n단 하나의 예복을 짓습니다.",
      primaryCtaLabel: "COLLECTION VIEW",
      primaryCtaHref: "#collection",
      secondaryCtaLabel: "BRAND STORY",
      secondaryCtaHref: "#about",
      imageAssetKey: "hero/main",
      imageAlt: "한복 예복을 입은 여인",
      imageAspectRatio: 3 / 4,
    },
  });

  // Brand Story
  await prisma.brandStory.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      eyebrow: "ABOUT SULLYUWHA",
      title: "시간이 지나도\n변하지 않는 가치",
      paragraphs: [
        "설유화는 궁중 예복의 정수와 현대적 감각이 만나는 곳입니다.",
        "당신의 이야기를 가장 아름다운 옷으로 완성해드립니다.",
      ],
      nameMeaningReading: "설유화",
      nameMeaningMeaning:
        "눈 속에 피어나는 설유화처럼, 고요함 속에서 은은히 빛나는 아름다움을 담은 이름입니다.",
      imageAssetKey: "about/portrait",
      imageAlt: "설유화 예복을 입은 모습",
      imageAspectRatio: 4 / 5,
    },
  });

  // Silk Features
  const features = [
    { id: "tradition", label: "TRADITION", title: "전통", description: "궁중의 예복에서 영감을 받아 전통의 가치를 담습니다." },
    { id: "craft", label: "CRAFTSMANSHIP", title: "장인정신", description: "장인의 손끝에서 탄생하는 섬세한 작업과 고귀한 선." },
    { id: "bespoke", label: "BESPOKE", title: "맞춤", description: "당신만을 위한 맞춤 디자인으로 특별한 가치를 선사합니다." },
    { id: "heritage", label: "HERITAGE", title: "계승", description: "시간이 지나도 변하지 않는 아름다움, 그 가치를 이어갑니다." },
  ];
  for (const [i, f] of features.entries()) {
    await prisma.silkFeature.upsert({
      where: { id: f.id },
      update: {},
      create: { id: f.id, label: f.label, title: f.title, description: f.description, sortOrder: i },
    });
  }

  // Categories
  const categories = [
    { id: "women", labelEn: "WOMEN", title: "여성 예복", imageAssetKey: "collection/women", imageAlt: "여성 예복", href: "#collection" },
    { id: "men", labelEn: "MEN", title: "남성 예복", imageAssetKey: "collection/men", imageAlt: "남성 예복", href: "#collection" },
    { id: "bespoke", labelEn: "BESPOKE", title: "맞춤 예복", imageAssetKey: "collection/bespoke", imageAlt: "맞춤 예복", href: "#bespoke" },
    { id: "accessories", labelEn: "ACCESSORIES", title: "장신구", imageAssetKey: "collection/accessories", imageAlt: "장신구", href: "#collection" },
  ];
  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, imageAspectRatio: 3 / 4, sortOrder: i },
    });
  }

  // Bespoke Content
  await prisma.bespokeContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      eyebrow: "BESPOKE SERVICE",
      title: "당신만을 위한\n단 하나의 예복",
      paragraphs: ["원단 선정부터 디자인, 제작까지 모든 과정을 섬세하게 맞춤으로 진행합니다."],
      ctaLabel: "자세히 보기",
      ctaHref: "#process",
      imageAssetKey: "bespoke/atelier",
      imageAlt: "맞춤 자수 디테일",
      imageAspectRatio: 4 / 5,
    },
  });

  // Process Steps
  const steps = [
    { stepId: "consult", icon: "consult", title: "상담 및 기획" },
    { stepId: "design", icon: "design", title: "디자인 제안" },
    { stepId: "fabric", icon: "fabric", title: "원단 선정" },
    { stepId: "handcraft", icon: "handcraft", title: "수작업 제작" },
    { stepId: "fitting", icon: "fitting", title: "피팅 및 완성" },
  ];
  for (const [i, s] of steps.entries()) {
    await prisma.processStep.upsert({
      where: { id: s.stepId },
      update: {},
      create: { id: s.stepId, stepId: s.stepId, icon: s.icon, title: s.title, sortOrder: i },
    });
  }

  // Products
  const products = [
    {
      id: "dangui-subok",
      name: "수복문 당의",
      category: "여성 예복",
      material: "본견(실크) · 손자수",
      description: "수(壽)와 복(福)을 새긴 손자수 당의. 예를 갖추는 자리에 기품을 더합니다.",
      imageAssetKey: "collection/dangui-subok",
      imageAlt: "수복문 당의",
      tags: ["당의", "손자수", "예식"],
      story: "당의는 조선 왕실 여인들의 대표 예복입니다. 곡선으로 흐르는 도련과 소매에, 장수와 복을 뜻하는 수복문을 한 땀 한 땀 손으로 놓았습니다. 은은한 본견의 광택 위로 자수가 도드라져, 격식 있는 자리에서 단정한 기품을 드러냅니다.",
      specs: [
        { label: "구성", value: "당의 단품" },
        { label: "소재", value: "본견(실크) 100%" },
        { label: "자수", value: "수복문 손자수" },
        { label: "안감", value: "본견 안감" },
        { label: "제작", value: "맞춤 제작(주문 후 제작)" },
      ],
      care: ["전문 한복 드라이클리닝 권장", "직사광선을 피해 통풍이 잘 되는 곳에 보관", "습기를 피하고 접힘 없이 걸어서 보관"],
      images: [
        { assetKey: "collection/dangui-subok-back", alt: "수복문 당의 뒷태", aspectRatio: 3 / 4 },
        { assetKey: "collection/dangui-subok-detail", alt: "수복문 당의 자수 디테일", aspectRatio: 3 / 4 },
      ],
    },
    {
      id: "seuran-skirt",
      name: "궁중 노방 스란치마",
      category: "여성 예복",
      material: "노방 · 금박",
      description: "노방 위에 금박을 올린 스란치마. 걸음마다 은은한 층을 이룹니다.",
      imageAssetKey: "collection/seuran-skirt",
      imageAlt: "궁중 노방 스란치마",
      tags: ["스란치마", "금박", "궁중"],
      story: "스란치마는 치마 자락에 스란단을 덧대어 격을 높인 궁중 치마입니다. 비치는 노방을 여러 겹 두어 걸을 때마다 빛이 층층이 스미고, 스란단의 금박이 조용히 반짝입니다. 화려함을 내세우지 않으면서도 자리를 완성하는 치마입니다.",
      specs: [
        { label: "구성", value: "스란치마 단품" },
        { label: "소재", value: "노방(견) · 금박" },
        { label: "치마 단", value: "스란단(금박)" },
        { label: "허리", value: "말기 · 끈 여밈" },
        { label: "제작", value: "맞춤 제작(주문 후 제작)" },
      ],
      care: ["전문 한복 드라이클리닝 권장", "금박은 마찰에 약하므로 접촉을 최소화", "걸어서 보관하고 눌림을 피할 것"],
      images: [
        { assetKey: "collection/seuran-skirt-detail", alt: "스란단 금박 디테일", aspectRatio: 3 / 4 },
        { assetKey: "collection/seuran-skirt-motion", alt: "노방 치마의 흐름", aspectRatio: 3 / 4, ext: "gif" },
      ],
    },
    {
      id: "mokhwa-dangui",
      name: "목화문 당의",
      category: "여성 예복",
      material: "본견(실크) · 자수",
      description: "목화 꽃을 수놓은 당의. 담백한 색과 절제된 자수로 현대적입니다.",
      imageAssetKey: "collection/mokhwa-dangui",
      imageAlt: "목화문 당의",
      tags: ["당의", "목화문", "모던"],
      story: "무명의 원료가 되는 목화는 정갈함과 다산을 상징합니다. 담백한 본견 바탕에 목화 꽃을 절제된 색으로 수놓아, 전통 당의의 실루엣을 현대적인 감각으로 풀었습니다. 예식은 물론 격식 있는 자리에 두루 어울립니다.",
      specs: [
        { label: "구성", value: "당의 단품" },
        { label: "소재", value: "본견(실크) 100%" },
        { label: "자수", value: "목화문 자수" },
        { label: "안감", value: "본견 안감" },
        { label: "제작", value: "맞춤 제작(주문 후 제작)" },
      ],
      care: ["전문 한복 드라이클리닝 권장", "직사광선을 피해 보관", "접힘 없이 걸어서 보관"],
      images: [
        { assetKey: "collection/mokhwa-dangui-detail", alt: "목화문 자수 디테일", aspectRatio: 3 / 4 },
      ],
    },
    {
      id: "durumagi",
      name: "남성 두루마기 예복",
      category: "남성 예복",
      material: "본견(실크)",
      description: "정갈한 선의 남성 두루마기. 격식과 편안함을 함께 담았습니다.",
      imageAssetKey: "collection/durumagi",
      imageAlt: "남성 두루마기 예복",
      tags: ["두루마기", "남성", "예식"],
      story: "두루마기는 겉옷의 정점으로, 남성 예복의 격을 완성합니다. 어깨에서 도련으로 이어지는 곧은 선과 단정한 고름이 차분한 위엄을 만듭니다. 본견의 은은한 광택으로 예를 갖추되, 몸을 편안하게 감싸도록 재단했습니다.",
      specs: [
        { label: "구성", value: "두루마기 단품" },
        { label: "소재", value: "본견(실크) 100%" },
        { label: "여밈", value: "고름 여밈" },
        { label: "안감", value: "본견 안감" },
        { label: "제작", value: "맞춤 제작(주문 후 제작)" },
      ],
      care: ["전문 한복 드라이클리닝 권장", "직사광선을 피해 보관", "걸어서 형태를 유지"],
      images: [
        { assetKey: "collection/durumagi-detail", alt: "두루마기 고름 디테일", aspectRatio: 3 / 4 },
      ],
    },
  ];

  for (const [i, p] of products.entries()) {
    const { images, ...productData } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...productData,
        imageAspectRatio: 3 / 4,
        sortOrder: i,
        images: {
          create: images.map((img, j) => ({ ...img, sortOrder: j })),
        },
      },
    });
  }

  // Gallery Items
  const galleryItems = [
    { id: "g1", assetKey: "gallery/01", alt: "실크 슬립 원피스 착장", aspectRatio: 3 / 4, caption: "Slip Dress", span: "tall" },
    { id: "g2", assetKey: "gallery/02", alt: "실크 블라우스 소매 디테일", aspectRatio: 4 / 3, caption: "Blouse Detail", span: "wide" },
    { id: "g3", assetKey: "gallery/03", alt: "실크 스카프 스타일링", aspectRatio: 1, caption: "Scarf Styling", span: "normal" },
    { id: "g4", assetKey: "gallery/04", alt: "실크의 광택과 결", aspectRatio: 1, caption: "Luster", span: "normal" },
    { id: "g5", assetKey: "gallery/05", alt: "와이드 셋업 착장", aspectRatio: 3 / 4, caption: "Wide Set", span: "tall" },
    { id: "g6", assetKey: "gallery/06", alt: "실크 파자마 세트", aspectRatio: 1, caption: "Loungewear", span: "normal" },
    { id: "g7", assetKey: "gallery/07", alt: "롱 실크 로브 실루엣", aspectRatio: 4 / 3, caption: "Long Robe", span: "wide" },
    { id: "g8", assetKey: "gallery/08", alt: "실크 원단 클로즈업", aspectRatio: 1, caption: "Fabric", span: "normal" },
  ];
  for (const [i, g] of galleryItems.entries()) {
    await prisma.galleryItem.upsert({
      where: { id: g.id },
      update: {},
      create: { ...g, sortOrder: i },
    });
  }

  // Contact Info
  await prisma.contactInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      showroomName: "설유화 아틀리에",
      address: "서울특별시 성동구 성수이로 12, 2층",
      phone: "02-1234-5678",
      email: "hello@sullyuwha.com",
      hours: [
        { label: "평일", value: "10:00 – 19:00" },
        { label: "토요일", value: "11:00 – 17:00" },
        { label: "일요일 · 공휴일", value: "예약제 운영" },
      ],
      note: "예복 상담과 맞춤 제작 문의를 받습니다. 원활한 상담을 위해 방문 예약을 권장드립니다.",
      socials: [
        { label: "Instagram", url: "https://www.instagram.com/sullyuwha" },
        { label: "Kakao", url: "https://pf.kakao.com" },
      ],
      imageAssetKey: "contact/atelier",
      imageAlt: "아틀리에 위치",
      imageAspectRatio: 16 / 9,
    },
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
