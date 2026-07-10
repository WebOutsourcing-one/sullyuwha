import type { HanbokProduct } from "@/domain/entities/HanbokProduct";
import { image } from "./image";

/** 한복 컬렉션 정적 데이터. */
export const productsData: readonly HanbokProduct[] = [
  {
    id: "dangui",
    name: "당의",
    hanja: "唐衣",
    category: "예복",
    description:
      "궁중 소례복에서 이어진 격식 있는 웃옷. 고운 곡선과 절제된 색으로 특별한 자리를 빛냅니다.",
    image: image("collection/dangui", "당의 한복", 3 / 4),
    tags: ["명주", "예복", "전통 자수"],
  },
  {
    id: "hwarot",
    name: "활옷",
    hanja: "闊衣",
    category: "혼례복",
    description:
      "혼례의 가장 화려한 옷. 모란과 봉황의 자수에 부부의 백년해로를 담았습니다.",
    image: image("collection/hwarot", "활옷 혼례복", 3 / 4),
    tags: ["혼례", "손자수", "정통"],
  },
  {
    id: "cheollik",
    name: "철릭",
    hanja: "帖裏",
    category: "생활한복",
    description:
      "허리에 주름을 잡아 활동성을 살린 옷. 오늘의 일상에서도 편히 걸칠 수 있게 다듬었습니다.",
    image: image("collection/cheollik", "철릭 원피스", 3 / 4),
    tags: ["생활한복", "모시", "데일리"],
  },
  {
    id: "jeogori",
    name: "저고리",
    hanja: "赤古里",
    category: "기본",
    description:
      "한복의 기본이자 얼굴. 깃과 동정, 고름의 균형으로 단정한 태를 완성합니다.",
    image: image("collection/jeogori", "저고리", 3 / 4),
    tags: ["기본", "맞춤", "사계절"],
  },
  {
    id: "dopo",
    name: "도포",
    hanja: "道袍",
    category: "남성 예복",
    description:
      "선비의 기품이 담긴 겉옷. 넓은 소매와 긴 자락이 걸음마다 단아한 선을 그립니다.",
    image: image("collection/dopo", "남성 도포", 3 / 4),
    tags: ["남성", "예복", "명주"],
  },
  {
    id: "norigae",
    name: "노리개",
    hanja: "",
    category: "장신구",
    description:
      "옷고름에 매다는 전통 장신구. 매듭과 술의 색으로 한 벌의 옷에 마침표를 찍습니다.",
    image: image("collection/norigae", "전통 노리개 장신구", 3 / 4),
    tags: ["장신구", "매듭", "포인트"],
  },
];
