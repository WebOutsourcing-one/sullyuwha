import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import type { Category } from "@/domain/entities/Category";
import type { BespokeContent } from "@/domain/entities/BespokeContent";
import type { ProcessStep } from "@/domain/entities/ProcessStep";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { image } from "./image";

/** 히어로 콘텐츠. */
export const heroData: HeroContent = {
  eyebrow: "SULLYUWHA — KOREAN COUTURE HANBOK",
  slogan: "고귀함이 서려있는\n기품있는 선",
  subcopy:
    "전통의 아름다움 위에 현대의 감각을 더해\n단 하나의 예복을 짓습니다.",
  primaryCta: { label: "COLLECTION VIEW", href: "#collection" },
  secondaryCta: { label: "BRAND STORY", href: "#about" },
  image: image("hero/main", "설유화 예복", 3 / 4),
};

/** 브랜드 소개(About). */
export const storyData: BrandStory = {
  eyebrow: "ABOUT SULLYUWHA",
  title: "시간이 지나도\n변하지 않는 가치",
  paragraphs: [
    "설유화는 궁중 예복의 정수와 현대적 감각이 만나는 곳입니다.",
    "당신의 이야기를 가장 아름다운 옷으로 완성해드립니다.",
  ],
  nameMeaning: {
    reading: "설유화",
    meaning:
      "눈 속에 피어나는 설유화처럼, 고요함 속에서 은은히 빛나는 아름다움을 담은 이름입니다.",
  },
  image: image("about/portrait", "설유화 예복을 입은 모습", 4 / 5),
};

/** 브랜드 특징(4 아이콘). id는 Icons.featureIcons 키와 일치. */
export const silkFeaturesData: readonly SilkFeature[] = [
  {
    id: "tradition",
    label: "TRADITION",
    title: "전통",
    description: "궁중의 예복에서 영감을 받아 전통의 가치를 담습니다.",
  },
  {
    id: "craft",
    label: "CRAFTSMANSHIP",
    title: "장인정신",
    description: "장인의 손끝에서 탄생하는 섬세한 작업과 고귀한 선.",
  },
  {
    id: "bespoke",
    label: "BESPOKE",
    title: "맞춤",
    description: "당신만을 위한 맞춤 디자인으로 특별한 가치를 선사합니다.",
  },
  {
    id: "heritage",
    label: "HERITAGE",
    title: "계승",
    description: "시간이 지나도 변하지 않는 아름다움, 그 가치를 이어갑니다.",
  },
];

/** 컬렉션 카테고리(여성/남성/맞춤/장신구). */
export const categoriesData: readonly Category[] = [
  {
    id: "women",
    labelEn: "WOMEN",
    title: "여성 예복",
    image: image("collection/women", "여성 예복", 3 / 4),
    href: "#collection",
  },
  {
    id: "men",
    labelEn: "MEN",
    title: "남성 예복",
    image: image("collection/men", "남성 예복", 3 / 4),
    href: "#collection",
  },
  {
    id: "bespoke",
    labelEn: "BESPOKE",
    title: "맞춤 예복",
    image: image("collection/bespoke", "맞춤 예복", 3 / 4),
    href: "#bespoke",
  },
  {
    id: "accessories",
    labelEn: "ACCESSORIES",
    title: "장신구",
    image: image("collection/accessories", "장신구", 3 / 4),
    href: "#collection",
  },
];

/** 맞춤(비스포크) 섹션. */
export const bespokeData: BespokeContent = {
  eyebrow: "BESPOKE SERVICE",
  title: "당신만을 위한\n단 하나의 예복",
  paragraphs: [
    "원단 선정부터 디자인, 제작까지 모든 과정을 섬세하게 맞춤으로 진행합니다.",
  ],
  cta: { label: "자세히 보기", href: "#process" },
  image: image("bespoke/atelier", "맞춤 자수 디테일", 4 / 5),
};

/** 맞춤 제작 과정(5단계). icon은 Icons.processIcons 키와 일치. */
export const processData: readonly ProcessStep[] = [
  { id: "consult", icon: "consult", title: "상담 및 기획" },
  { id: "design", icon: "design", title: "디자인 제안" },
  { id: "fabric", icon: "fabric", title: "원단 선정" },
  { id: "handcraft", icon: "handcraft", title: "수작업 제작" },
  { id: "fitting", icon: "fitting", title: "피팅 및 완성" },
];

/** 문의 · 아틀리에. */
export const contactData: ContactInfo = {
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
  mapImage: image("contact/atelier", "아틀리에 위치", 16 / 9),
};
