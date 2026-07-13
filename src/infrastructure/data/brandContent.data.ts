import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { image } from "./image";

/** 히어로 콘텐츠. */
export const heroData: HeroContent = {
  eyebrow: "SEOLYUHWA — SILK READY-TO-WEAR",
  slogan: "매일 두르는\n고요한 광택",
  subcopy:
    "설유화는 실크를 특별한 날의 옷에서 매일의 옷으로 옮깁니다. 부담 없이 입고, 오래 곁에 두는 실크 기성복.",
  primaryCta: { label: "컬렉션 보기", href: "#collection" },
  secondaryCta: { label: "브랜드 이야기", href: "#story" },
  image: image("hero/main", "실크 룩을 입은 모습", 3 / 4),
};

/** 브랜드 소개. */
export const storyData: BrandStory = {
  eyebrow: "OUR STORY",
  title: "실크를 일상의 언어로",
  paragraphs: [
    "설유화는 실크가 옷장 깊숙이 걸려 있는 옷이 아니라, 매일 손이 가는 옷이기를 바랍니다.",
    "그래서 관리가 어렵지 않은 원사를 고르고, 몸을 편안하게 감싸는 실루엣으로 짓습니다. 격식은 덜고, 촉감과 품질은 그대로.",
    "화려함으로 시선을 끌기보다, 입은 사람의 하루에 자연스레 스며드는 옷 — 그것이 설유화가 만드는 실크입니다.",
  ],
  nameMeaning: {
    reading: "설유화",
    meaning:
      "부드럽게 흐르는 실크처럼, 일상에 은은히 피어나는 아름다움을 담은 이름입니다.",
  },
  image: image("story/atelier", "실크 원단을 살피는 모습", 4 / 5),
};

/** 실크 소재 이야기(피처). */
export const silkFeaturesData: readonly SilkFeature[] = [
  {
    id: "luster",
    label: "LUSTER",
    title: "깊은 광택과 드레이프",
    description:
      "빛을 부드럽게 머금는 실크 특유의 광택과, 몸을 따라 흐르는 자연스러운 드레이프.",
    image: image("silk/luster", "실크의 광택", 4 / 3),
  },
  {
    id: "breathe",
    label: "BREATHE",
    title: "사계절 통기성",
    description:
      "여름엔 시원하고 겨울엔 따뜻한 천연 단백질 섬유. 계절을 가리지 않고 입습니다.",
    image: image("silk/breathe", "통기성 좋은 실크", 4 / 3),
  },
  {
    id: "grade",
    label: "GRADE 6A",
    title: "균일한 원사 등급",
    description:
      "최상급 6A 등급 원사와 안정적인 momme로 균일하고 오래가는 옷을 짓습니다.",
    image: image("silk/grade", "실크 원사", 4 / 3),
  },
  {
    id: "care",
    label: "HOME CARE",
    title: "집에서 관리하는 실크",
    description:
      "중성세제 손세탁과 그늘 건조. 어렵지 않게 오래 입도록 케어 가이드를 함께 드립니다.",
    image: image("silk/care", "실크 홈 케어", 4 / 3),
  },
];

/** 문의 · 스토어. */
export const contactData: ContactInfo = {
  showroomName: "설유화 쇼룸",
  address: "서울특별시 성동구 성수이로 12, 2층",
  phone: "02-1234-5678",
  email: "hello@sullyuwha.com",
  hours: [
    { label: "평일", value: "11:00 – 20:00" },
    { label: "토요일", value: "12:00 – 18:00" },
    { label: "일요일 · 공휴일", value: "휴무" },
  ],
  note: "제품 구매 상담과 편집숍·리테일 입점 문의를 받습니다. 방문은 예약을 권장드립니다.",
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/sullyuwha" },
    { label: "Kakao", url: "https://pf.kakao.com" },
  ],
  mapImage: image("contact/map", "쇼룸 위치 약도", 16 / 9),
};
