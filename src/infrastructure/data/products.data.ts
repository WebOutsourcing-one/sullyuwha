import type { Product } from "@/domain/entities/Product";
import { image } from "./image";

/** 컬렉션(실크 기성복) 정적 데이터. */
export const productsData: readonly Product[] = [
  {
    id: "slip-dress",
    name: "실크 슬립 원피스",
    category: "원피스",
    material: "실크 100% · 19 momme",
    description:
      "몸의 선을 따라 흐르는 바이어스 재단. 낮에는 단독으로, 밤에는 레이어드로 입는 한 벌.",
    image: image("collection/slip-dress", "실크 슬립 원피스", 3 / 4),
    gallery: [
      image("collection/slip-dress-back", "실크 슬립 원피스 뒷모습", 3 / 4),
      image(
        "collection/slip-dress-detail",
        "실크 슬립 원피스 바이어스 재단 디테일",
        3 / 4,
      ),
      image(
        "collection/slip-dress-motion",
        "움직일 때 흐르는 실크 슬립 원피스의 드레이프",
        3 / 4,
        "gif",
      ),
    ],
    tags: ["바이어스", "데일리", "레이어드"],
    story:
      "원단의 결을 45도로 눕혀 재단하는 바이어스 방식은 실크가 몸을 감싸며 자연스럽게 떨어지도록 합니다. 니트 위에 겹쳐 입으면 낮의 옷이, 얇은 카디건을 걸치면 밤의 옷이 됩니다. 한 벌로 계절과 시간을 가로지르는, 옷장의 기준이 되는 원피스입니다.",
    specs: [
      { label: "소재", value: "실크 100%" },
      { label: "두께", value: "19 momme" },
      { label: "실루엣", value: "바이어스 스트레이트" },
      { label: "안감", value: "무안감(단일 겹)" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "드라이클리닝 권장",
      "직사광선을 피해 그늘에서 평평하게 건조",
      "낮은 온도로 안감 쪽에서 다림질",
    ],
  },
  {
    id: "blouse",
    name: "실크 블라우스",
    category: "블라우스",
    material: "실크 100% · 16 momme",
    description:
      "은은한 광택의 기본 블라우스. 정장에도 데님에도 어울리는 절제된 실루엣.",
    image: image("collection/blouse", "실크 블라우스", 3 / 4),
    gallery: [
      image("collection/blouse-detail", "실크 블라우스 카라 디테일", 3 / 4),
      image("collection/blouse-styling", "실크 블라우스 스타일링 컷", 3 / 4),
    ],
    tags: ["베이식", "오피스", "광택"],
    story:
      "장식을 덜어낸 기본 블라우스일수록 소재가 전부를 말합니다. 16 momme의 가벼운 실크는 은은한 광택으로 얼굴을 밝히고, 절제된 카라와 여밈은 정장 재킷 안에도, 데님 위에도 무리 없이 어울립니다. 매일 손이 가는 한 장을 위해 남긴 최소한의 디자인입니다.",
    specs: [
      { label: "소재", value: "실크 100%" },
      { label: "두께", value: "16 momme" },
      { label: "실루엣", value: "레귤러 · 세미 오버" },
      { label: "여밈", value: "숨김 단추" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "드라이클리닝 권장",
      "중성세제로 30℃ 이하 단독 손세탁 가능",
      "물기를 짜지 말고 눌러 뺀 뒤 그늘 건조",
    ],
  },
  {
    id: "setup",
    name: "와이드 셋업",
    category: "셋업",
    material: "실크 혼방 · 22 momme",
    description:
      "떨어지는 드레이프의 와이드 팬츠와 재킷. 편안하되 격을 잃지 않는 셋업.",
    image: image("collection/setup", "실크 와이드 셋업", 3 / 4),
    gallery: [
      image("collection/setup-pants", "와이드 셋업 팬츠 드레이프", 3 / 4),
      image("collection/setup-jacket", "와이드 셋업 재킷 디테일", 3 / 4),
      image(
        "collection/setup-motion",
        "걸을 때 흐르는 와이드 셋업의 움직임",
        3 / 4,
        "gif",
      ),
    ],
    tags: ["셋업", "드레이프", "모던"],
    story:
      "실크에 소량의 혼방을 더해 형태를 잡되 드레이프는 살렸습니다. 와이드 팬츠는 걸을 때마다 유연하게 흐르고, 재킷은 어깨를 부드럽게 감쌉니다. 위아래를 함께, 혹은 따로 떼어 입어도 완성되는 모던한 셋업입니다.",
    specs: [
      { label: "소재", value: "실크 혼방" },
      { label: "두께", value: "22 momme" },
      { label: "실루엣", value: "와이드 · 릴랙스" },
      { label: "구성", value: "재킷 + 팬츠(분리 착용 가능)" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "드라이클리닝 전용",
      "형태 유지를 위해 옷걸이에 걸어 보관",
      "스팀다리미로 구김 정리",
    ],
  },
  {
    id: "scarf",
    name: "실크 스카프",
    category: "액세서리",
    material: "실크 100% · 트윌",
    description:
      "한 장으로 분위기를 바꾸는 트윌 스카프. 목에, 가방에, 머리에 자유롭게.",
    image: image("collection/scarf", "실크 트윌 스카프", 3 / 4),
    gallery: [
      image("collection/scarf-knot", "실크 스카프 매듭 연출", 3 / 4),
      image("collection/scarf-detail", "실크 트윌 짜임 디테일", 3 / 4),
    ],
    tags: ["포인트", "트윌", "선물"],
    story:
      "촘촘하게 짠 트윌 실크는 매듭이 야무지게 잡히고 색이 깊게 물듭니다. 목에 두르면 옷차림에 온도가 더해지고, 가방 손잡이나 머리에 묶으면 작은 포인트가 됩니다. 부담 없이 건네기 좋아 선물로도 오래 사랑받는 한 장입니다.",
    specs: [
      { label: "소재", value: "실크 100%" },
      { label: "짜임", value: "트윌" },
      { label: "크기", value: "90 × 90 cm" },
      { label: "마감", value: "핸드롤 헤리" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "드라이클리닝 권장",
      "향수·화장품이 직접 닿지 않도록 착용 후 사용",
      "접어서 서늘한 곳에 보관",
    ],
  },
  {
    id: "pajama",
    name: "실크 파자마 세트",
    category: "라운지",
    material: "실크 100% · 19 momme",
    description:
      "피부에 닿는 매끄러움. 잠옷을 넘어 홈웨어로도 입는 상하 세트.",
    image: image("collection/pajama", "실크 파자마 세트", 3 / 4),
    gallery: [
      image("collection/pajama-detail", "실크 파자마 파이핑 디테일", 3 / 4),
      image("collection/pajama-styling", "실크 파자마 세트 착장 컷", 3 / 4),
    ],
    tags: ["홈웨어", "부드러움", "세트"],
    story:
      "실크는 밤새 피부와 머리카락의 마찰을 줄여 줍니다. 19 momme의 매끄러운 감촉과 통기성은 잠자리를 한결 쾌적하게 하고, 정갈한 파이핑 디테일은 홈웨어로 입어도 흐트러짐이 없습니다. 하루의 끝을 위한 가장 부드러운 한 벌입니다.",
    specs: [
      { label: "소재", value: "실크 100%" },
      { label: "두께", value: "19 momme" },
      { label: "실루엣", value: "릴랙스 · 파이핑 디테일" },
      { label: "구성", value: "상의 + 하의" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "중성세제로 30℃ 이하 단독 손세탁",
      "표백제·섬유유연제 사용 금지",
      "그늘에서 평평하게 건조",
    ],
  },
  {
    id: "robe",
    name: "롱 실크 로브",
    category: "아우터",
    material: "실크 100% · 22 momme",
    description:
      "가볍게 걸치는 긴 로브. 실내에서도, 리조트에서도 우아하게 완성하는 겉옷.",
    image: image("collection/robe", "롱 실크 로브", 3 / 4),
    gallery: [
      image("collection/robe-back", "롱 실크 로브 뒷모습", 3 / 4),
      image("collection/robe-detail", "롱 실크 로브 허리끈 디테일", 3 / 4),
      image(
        "collection/robe-motion",
        "흐르듯 움직이는 롱 실크 로브",
        3 / 4,
        "gif",
      ),
    ],
    tags: ["가운", "리조트", "우아함"],
    story:
      "발등까지 떨어지는 기장에 22 momme의 묵직한 실크가 만드는 드레이프가 걸음마다 유려하게 흐릅니다. 파자마 위에 걸치면 실내의 겉옷이, 수영복 위에 두르면 리조트의 커버업이 됩니다. 허리끈 하나로 실루엣이 완성되는 우아한 한 벌입니다.",
    specs: [
      { label: "소재", value: "실크 100%" },
      { label: "두께", value: "22 momme" },
      { label: "기장", value: "롱(발등 라인)" },
      { label: "여밈", value: "허리끈 · 사이드 포켓" },
      { label: "원산지", value: "대한민국" },
    ],
    care: [
      "드라이클리닝 권장",
      "옷걸이에 걸어 형태 유지",
      "낮은 온도로 안쪽에서 다림질",
    ],
  },
];
