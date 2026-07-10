import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { CraftStep } from "@/domain/entities/CraftStep";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { image } from "./image";

/** 히어로 콘텐츠. */
export const heroData: HeroContent = {
  eyebrow: "秀麗花 · 수려화",
  slogan: "한 땀에 스민\n오래된 아름다움",
  subcopy:
    "수려화는 우리 옷의 결과 색을 오늘의 삶에 맞춰 짓습니다. 전통의 격식은 지키되, 입는 이의 하루에 스며들도록.",
  primaryCta: { label: "컬렉션 보기", href: "#collection" },
  secondaryCta: { label: "브랜드 이야기", href: "#story" },
  image: image("hero/main", "고운 색의 한복을 입은 모습", 3 / 4),
};

/** 브랜드 스토리. */
export const storyData: BrandStory = {
  eyebrow: "布 · 옷감에서 시작하다",
  title: "느리게, 그러나 오래 남도록",
  paragraphs: [
    "수려화는 옷감을 고르는 일에서 시작합니다. 명주와 모시, 삼베의 결을 손으로 확인하고, 계절과 자리에 어울리는 빛깔을 고릅니다.",
    "재단과 바느질은 서두르지 않습니다. 한 벌의 옷이 몸의 곡선을 따라 자연스레 흐르도록, 오랜 손끝의 감각으로 짓습니다.",
    "우리는 전통을 박제하지 않습니다. 오늘을 사는 사람이 편히 입고, 오래 곁에 둘 수 있는 옷 — 그것이 수려화가 지키려는 아름다움입니다.",
  ],
  nameMeaning: {
    hanja: "秀麗花",
    reading: "수려화",
    meaning: "빼어나게 아름다운 꽃. 우리 옷이 사람을 꽃처럼 돋보이게 하기를 바라는 마음을 담았습니다.",
  },
  image: image("story/atelier", "옷감을 살피는 장인의 손", 4 / 5),
};

/** 제작 과정(장인정신) 단계. */
export const craftStepsData: readonly CraftStep[] = [
  {
    order: 1,
    title: "옷감 고르기",
    subtitle: "擇布",
    description:
      "명주·모시·삼베의 결과 무게를 손으로 가늠하고, 자리와 계절에 맞는 빛깔을 고릅니다.",
    image: image("craft/select", "여러 색의 옷감을 고르는 모습", 4 / 3),
  },
  {
    order: 2,
    title: "본과 재단",
    subtitle: "裁斷",
    description:
      "입는 이의 치수에 맞춰 본을 뜨고, 결을 살려 옷감을 마릅니다. 여기서 옷의 태가 결정됩니다.",
    image: image("craft/cut", "옷감을 재단하는 모습", 4 / 3),
  },
  {
    order: 3,
    title: "손바느질",
    subtitle: "縫製",
    description:
      "곱솔과 감침으로 한 땀 한 땀 잇습니다. 겉으로 드러나지 않는 안쪽까지 정갈하게 마무리합니다.",
    image: image("craft/sew", "손바느질하는 장인의 손", 4 / 3),
  },
  {
    order: 4,
    title: "다림과 완성",
    subtitle: "完成",
    description:
      "동정과 깃을 세우고 결을 다려, 옷이 가장 아름다운 선을 갖추도록 마지막을 손질합니다.",
    image: image("craft/finish", "완성된 한복을 손질하는 모습", 4 / 3),
  },
];

/** 문의 · 오시는 길. */
export const contactData: ContactInfo = {
  studioName: "수려화 한복 공방",
  address: "서울특별시 종로구 북촌로 11길 24, 한옥 1층",
  phone: "02-1234-5678",
  email: "atelier@sullyuwha.com",
  hours: [
    { label: "평일", value: "10:00 – 19:00" },
    { label: "토요일", value: "11:00 – 17:00" },
    { label: "일요일 · 공휴일", value: "휴무 (예약 시 방문 가능)" },
  ],
  reservationNote:
    "맞춤 상담은 예약제로 운영됩니다. 원하시는 자리와 일정, 예산을 알려주시면 결에 맞는 옷을 함께 그려 드립니다.",
  socials: [
    { label: "Instagram", url: "https://instagram.com" },
    { label: "Kakao", url: "https://pf.kakao.com" },
  ],
  mapImage: image("contact/map", "공방 위치 약도", 16 / 9),
};
