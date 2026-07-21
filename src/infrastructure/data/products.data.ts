import type { Product } from "@/domain/entities/Product";
import { image } from "./image";

/** 컬렉션(한복 예복) 정적 데이터. BEST COLLECTION · 상세 페이지에 사용. */
export const productsData: readonly Product[] = [
  {
    id: "dangui-subok",
    name: "수복문 당의",
    category: "여성 예복",
    material: "본견(실크) · 손자수",
    description:
      "수(壽)와 복(福)을 새긴 손자수 당의. 예를 갖추는 자리에 기품을 더합니다.",
    image: image("collection/dangui-subok", "수복문 당의", 3 / 4),
    gallery: [
      image("collection/dangui-subok-back", "수복문 당의 뒷태", 3 / 4),
      image("collection/dangui-subok-detail", "수복문 당의 자수 디테일", 3 / 4),
    ],
    tags: ["당의", "손자수", "예식"],
    story:
      "당의는 조선 왕실 여인들의 대표 예복입니다. 곡선으로 흐르는 도련과 소매에, 장수와 복을 뜻하는 수복문을 한 땀 한 땀 손으로 놓았습니다. 은은한 본견의 광택 위로 자수가 도드라져, 격식 있는 자리에서 단정한 기품을 드러냅니다.",
    specs: [
      { label: "구성", value: "당의 단품" },
      { label: "소재", value: "본견(실크) 100%" },
      { label: "자수", value: "수복문 손자수" },
      { label: "안감", value: "본견 안감" },
      { label: "제작", value: "맞춤 제작(주문 후 제작)" },
    ],
    care: [
      "전문 한복 드라이클리닝 권장",
      "직사광선을 피해 통풍이 잘 되는 곳에 보관",
      "습기를 피하고 접힘 없이 걸어서 보관",
    ],
  },
  {
    id: "seuran-skirt",
    name: "궁중 노방 스란치마",
    category: "여성 예복",
    material: "노방 · 금박",
    description:
      "노방 위에 금박을 올린 스란치마. 걸음마다 은은한 층을 이룹니다.",
    image: image("collection/seuran-skirt", "궁중 노방 스란치마", 3 / 4),
    gallery: [
      image("collection/seuran-skirt-detail", "스란단 금박 디테일", 3 / 4),
      image("collection/seuran-skirt-motion", "노방 치마의 흐름", 3 / 4, "gif"),
    ],
    tags: ["스란치마", "금박", "궁중"],
    story:
      "스란치마는 치마 자락에 스란단을 덧대어 격을 높인 궁중 치마입니다. 비치는 노방을 여러 겹 두어 걸을 때마다 빛이 층층이 스미고, 스란단의 금박이 조용히 반짝입니다. 화려함을 내세우지 않으면서도 자리를 완성하는 치마입니다.",
    specs: [
      { label: "구성", value: "스란치마 단품" },
      { label: "소재", value: "노방(견) · 금박" },
      { label: "치마 단", value: "스란단(금박)" },
      { label: "허리", value: "말기 · 끈 여밈" },
      { label: "제작", value: "맞춤 제작(주문 후 제작)" },
    ],
    care: [
      "전문 한복 드라이클리닝 권장",
      "금박은 마찰에 약하므로 접촉을 최소화",
      "걸어서 보관하고 눌림을 피할 것",
    ],
  },
  {
    id: "mokhwa-dangui",
    name: "목화문 당의",
    category: "여성 예복",
    material: "본견(실크) · 자수",
    description:
      "목화 꽃을 수놓은 당의. 담백한 색과 절제된 자수로 현대적입니다.",
    image: image("collection/mokhwa-dangui", "목화문 당의", 3 / 4),
    gallery: [
      image("collection/mokhwa-dangui-detail", "목화문 자수 디테일", 3 / 4),
    ],
    tags: ["당의", "목화문", "모던"],
    story:
      "무명의 원료가 되는 목화는 정갈함과 다산을 상징합니다. 담백한 본견 바탕에 목화 꽃을 절제된 색으로 수놓아, 전통 당의의 실루엣을 현대적인 감각으로 풀었습니다. 예식은 물론 격식 있는 자리에 두루 어울립니다.",
    specs: [
      { label: "구성", value: "당의 단품" },
      { label: "소재", value: "본견(실크) 100%" },
      { label: "자수", value: "목화문 자수" },
      { label: "안감", value: "본견 안감" },
      { label: "제작", value: "맞춤 제작(주문 후 제작)" },
    ],
    care: [
      "전문 한복 드라이클리닝 권장",
      "직사광선을 피해 보관",
      "접힘 없이 걸어서 보관",
    ],
  },
  {
    id: "durumagi",
    name: "남성 두루마기 예복",
    category: "남성 예복",
    material: "본견(실크)",
    description:
      "정갈한 선의 남성 두루마기. 격식과 편안함을 함께 담았습니다.",
    image: image("collection/durumagi", "남성 두루마기 예복", 3 / 4),
    gallery: [
      image("collection/durumagi-detail", "두루마기 고름 디테일", 3 / 4),
    ],
    tags: ["두루마기", "남성", "예식"],
    story:
      "두루마기는 겉옷의 정점으로, 남성 예복의 격을 완성합니다. 어깨에서 도련으로 이어지는 곧은 선과 단정한 고름이 차분한 위엄을 만듭니다. 본견의 은은한 광택으로 예를 갖추되, 몸을 편안하게 감싸도록 재단했습니다.",
    specs: [
      { label: "구성", value: "두루마기 단품" },
      { label: "소재", value: "본견(실크) 100%" },
      { label: "여밈", value: "고름 여밈" },
      { label: "안감", value: "본견 안감" },
      { label: "제작", value: "맞춤 제작(주문 후 제작)" },
    ],
    care: [
      "전문 한복 드라이클리닝 권장",
      "직사광선을 피해 보관",
      "걸어서 형태를 유지",
    ],
  },
];
