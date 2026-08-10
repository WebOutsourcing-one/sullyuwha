import type { Product } from "@/domain/entities/Product";
import { image } from "./image";

/**
 * 컬렉션(한복 예복) 정적 데이터. BEST COLLECTION · 상세 페이지에 사용.
 *
 * `price: 0`은 "가격 미정"이며 상세 페이지에 결제 버튼 대신 문의 CTA가 나간다.
 * 실제 판매가는 임의로 정할 수 없으므로 여기서는 0으로 두고,
 * 관리자 화면(`/sull-admin/products`)에서 품목별로 입력한다.
 * 즉 결제 흐름을 타려면 `DATA_SOURCE=database`로 실제 DB를 써야 한다.
 */
export const productsData: readonly Product[] = [
  {
    id: "dangui-bonghwang",
    name: "봉황문 부금 당의",
    category: "여성 예복",
    material: "본견(명주) · 부금(금사) 자수",
    description:
      "봉황의 고귀함을 수놓아 왕비의 기품과 품위를 담은 예복입니다.",
    price: 0,
    image: image("collection/dangui-bonghwang", "봉황문 부금 당의", 3 / 4),
    thumbnail: image(
      "collection/dangui-bonghwang-thumb",
      "봉황문 부금 당의",
      3 / 4,
    ),
    isBest: true,
    tags: ["당의", "부금", "봉황문", "예식"],
    // story는 두지 않는다 — 같은 문단이 detail.highlight.body에 있고,
    // 상세 페이지는 highlight가 있으면 story를 렌더하지 않는다.
    specs: [
      { label: "제품명", value: "봉황문 부금 당의" },
      { label: "색상", value: "진홍" },
      { label: "소재", value: "겉감 : 실크(명주) / 자수 : 금사(부금)" },
      { label: "안감", value: "명주(실크 100%)" },
      { label: "구성", value: "당의, 스란치마, 부금수식" },
      { label: "제작", value: "설유화" },
    ],
    care: [
      "전문 한복 드라이클리닝 권장",
      "부금은 마찰에 약하므로 접촉을 최소화",
      "직사광선과 습기를 피해 걸어서 보관",
    ],
    detail: {
      subtitle: "鳳凰紋 負衿 唐衣",
      tagline: "귀한 순간을 더 빛나게 하는 품격의 예복",
      intro: "봉황의 고귀함을 수놓아\n왕비의 기품과 품위를 담은 예복입니다.",
      highlight: {
        title: "봉황, 고귀함과 영원의 상징",
        body: "봉황은 예로부터 덕과 지혜를 지닌 군자의 상징으로, 왕비의 기품과 복을 기원하는 의미를 담고 있습니다. 부금 자수로 정교하게 표현된 봉황문은 예복의 품격을 한층 더 높여줍니다.",
        image: image(
          "collection/dangui-bonghwang-embroidery",
          "부금으로 수놓은 봉황문 자수",
          4 / 3,
        ),
      },
      features: [
        {
          title: "정교한 수복문 자수",
          body: "옷 전체에 수복문을 금실로 수놓아 복과 장수를 기원하는 전통의 의미를 더하였습니다.",
          image: image(
            "collection/dangui-bonghwang-subok",
            "당의 앞길의 수복문 금사 자수",
            4 / 3,
          ),
        },
        {
          title: "부금 봉황문 자수",
          body: "스란치마 하단에는 봉황을 중심으로 꽃과 구름을 수놓아 왕실의 위엄을 표현하였습니다.",
          image: image(
            "collection/dangui-bonghwang-seuran",
            "스란치마 하단의 부금 봉황문",
            4 / 3,
          ),
        },
        {
          title: "명주 안감",
          body: "안감은 부드러운 명주로 제작되어 착용감이 우수하며, 자연스러운 광택이 고급스러움을 더합니다.",
          image: image(
            "collection/dangui-bonghwang-lining",
            "당의 안쪽의 명주 안감",
            4 / 3,
          ),
        },
      ],
      modelShots: [
        image("collection/dangui-bonghwang-model-1", "봉황문 부금 당의 정면", 3 / 4),
        image("collection/dangui-bonghwang-model-2", "봉황문 부금 당의 측면", 3 / 4),
        image("collection/dangui-bonghwang-model-3", "봉황문 부금 당의 뒷태", 3 / 4),
      ],
      notes: [
        "모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다.",
        "사이즈는 제작 과정에서 1~2cm의 오차가 있을 수 있습니다.",
      ],
    },
  },
  {
    id: "dangui-subok",
    name: "수복문 당의",
    category: "여성 예복",
    material: "본견(실크) · 손자수",
    description:
      "수(壽)와 복(福)을 새긴 손자수 당의. 예를 갖추는 자리에 기품을 더합니다.",
    price: 0,
    image: image("collection/dangui-subok", "수복문 당의", 3 / 4),
    isBest: false,
    tags: ["당의", "손자수", "예식"],
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
    detail: {
      subtitle: "壽福紋 唐衣",
      tagline: "수와 복을 새겨, 마음을 담다",
      intro: "수(壽)와 복(福)을 새겨\n예를 갖추는 자리에 기품을 더합니다.",
      highlight: {
        title: "수복문, 장수와 복의 기원",
        body: "당의는 조선 왕실 여인들의 대표 예복입니다. 수(壽)는 오래 삶을, 복(福)은 누릴 복을 뜻합니다. 곡선으로 흐르는 도련과 소매 위에 수복문을 한 땀 한 땀 손으로 놓아, 입는 이를 위한 간절한 기원을 담았습니다.",
        image: image(
          "collection/dangui-subok-embroidery",
          "수복문 손자수 클로즈업",
          4 / 3,
        ),
      },
      features: [
        {
          title: "한 땀 한 땀 손자수",
          body: "수복문은 기계가 아닌 손으로 놓아 문양마다 고유한 결이 살아 있습니다. 금실로 수놓은 문자가 본견 위에서 은은하게 빛납니다.",
          image: image(
            "collection/dangui-subok-stitch",
            "수복문 손자수 디테일",
            4 / 3,
          ),
        },
        {
          title: "곡선으로 흐르는 실루엣",
          body: "어깨에서 도련으로 이어지는 곡선이 몸을 단정하게 감쌉니다. 움직일 때마다 옷자락이 부드럽게 흐르며 우아한 자태를 만듭니다.",
          image: image(
            "collection/dangui-subok-line",
            "수복문 당의 곡선 실루엣",
            4 / 3,
          ),
        },
        {
          title: "본견의 은은한 광택",
          body: "자수를 받치는 본견은 자연스러운 광택을 지녀 고급스러움을 더합니다. 격식 있는 자리에서 단정한 기품을 드러냅니다.",
          image: image(
            "collection/dangui-subok-fabric",
            "수복문 당의 본견 원단",
            4 / 3,
          ),
        },
      ],
      modelShots: [
        image("collection/dangui-subok-back", "수복문 당의 뒷태", 3 / 4),
        image("collection/dangui-subok-detail", "수복문 당의 자수 디테일", 3 / 4),
      ],
      notes: [
        "모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다.",
        "사이즈는 제작 과정에서 1~2cm의 오차가 있을 수 있습니다.",
      ],
    },
  },
  {
    id: "seuran-skirt",
    name: "궁중 노방 스란치마",
    category: "여성 예복",
    material: "노방 · 금박",
    description:
      "노방 위에 금박을 올린 스란치마. 걸음마다 은은한 층을 이룹니다.",
    price: 0,
    image: image("collection/seuran-skirt", "궁중 노방 스란치마", 3 / 4),
    isBest: false,
    tags: ["스란치마", "금박", "궁중"],
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
    detail: {
      subtitle: "宮中 膝襴裳",
      tagline: "걸음마다 빛이 스미는, 궁중의 격",
      intro: "비치는 노방을 여러 겹 두어\n걸을 때마다 빛이 층층이 스미는 궁중 치마입니다.",
      highlight: {
        title: "스란단, 격을 높이는 장식선",
        body: "스란치마는 치마 자락에 스란단을 덧대어 격을 높인 궁중 치마입니다. 금박으로 장식한 스란단이 치마 밑단을 따라 돌며, 화려함을 내세우지 않으면서도 자리를 완성합니다.",
        image: image(
          "collection/seuran-skirt-detail",
          "스란단 금박 디테일",
          4 / 3,
        ),
      },
      features: [
        {
          title: "비치는 노방의 층",
          body: "노방을 여러 겹 두어 걸을 때마다 빛이 층층이 스밉니다. 가볍게 흐르는 자락이 은은한 존재감을 만듭니다.",
          image: image(
            "collection/seuran-skirt-motion",
            "노방 치마의 흐름",
            4 / 3,
            "gif",
          ),
        },
        {
          title: "스란단의 금박",
          body: "치마 밑단에 돌린 스란단은 금박으로 마감해 걸음마다 조용히 반짝입니다.",
          image: image(
            "collection/seuran-skirt-geumpak",
            "스란단 금박 클로즈업",
            4 / 3,
          ),
        },
        {
          title: "말기와 끈 여밈",
          body: "허리는 말기와 끈으로 여며, 기성복 못지않게 편안하게 착용할 수 있습니다.",
          image: image(
            "collection/seuran-skirt-waist",
            "스란치마 허리 여밈",
            4 / 3,
          ),
        },
      ],
      modelShots: [
        image("collection/seuran-skirt-model-1", "궁중 노방 스란치마 정면", 3 / 4),
        image("collection/seuran-skirt-model-2", "궁중 노방 스란치마 측면", 3 / 4),
        image("collection/seuran-skirt-model-3", "궁중 노방 스란치마 뒷태", 3 / 4),
      ],
      notes: [
        "모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다.",
        "사이즈는 제작 과정에서 1~2cm의 오차가 있을 수 있습니다.",
      ],
    },
  },
  {
    id: "mokhwa-dangui",
    name: "목화문 당의",
    category: "여성 예복",
    material: "본견(실크) · 자수",
    description:
      "목화 꽃을 수놓은 당의. 담백한 색과 절제된 자수로 현대적입니다.",
    price: 0,
    image: image("collection/mokhwa-dangui", "목화문 당의", 3 / 4),
    isBest: false,
    tags: ["당의", "목화문", "모던"],
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
    detail: {
      subtitle: "木花紋 唐衣",
      tagline: "담백한 색, 절제된 아름다움",
      intro: "목화 꽃을 절제된 색으로 수놓아\n전통의 실루엣을 현대적으로 풀어냈습니다.",
      highlight: {
        title: "목화, 정갈함과 다산의 상징",
        body: "무명의 원료가 되는 목화는 정갈함과 다산을 상징합니다. 담백한 본견 바탕 위에 목화 꽃을 절제된 색으로 수놓아, 전통 당의의 실루엣을 현대적인 감각으로 풀었습니다.",
        image: image(
          "collection/mokhwa-dangui-detail",
          "목화문 자수 디테일",
          4 / 3,
        ),
      },
      features: [
        {
          title: "절제된 목화문 자수",
          body: "큰 무늬 대신 목화 꽃을 조용히 배치해 담백한 분위기를 만듭니다. 가까이서 볼수록 자수의 섬세함이 드러납니다.",
          image: image(
            "collection/mokhwa-dangui-embroidery",
            "목화문 자수 클로즈업",
            4 / 3,
          ),
        },
        {
          title: "담백한 본견의 바탕",
          body: "은은한 본견의 광택 위에서 자수가 조용히 도드라집니다. 장식을 줄인 만큼 원단의 질감이 살아 있습니다.",
          image: image(
            "collection/mokhwa-dangui-fabric",
            "목화문 당의 본견 원단",
            4 / 3,
          ),
        },
        {
          title: "현대적 당의 실루엣",
          body: "전통 당의의 곡선을 살리되 장식을 절제해, 예식은 물론 격식 있는 자리에 두루 어울립니다.",
          image: image(
            "collection/mokhwa-dangui-line",
            "목화문 당의 실루엣",
            4 / 3,
          ),
        },
      ],
      modelShots: [
        image("collection/mokhwa-dangui-model-1", "목화문 당의 정면", 3 / 4),
        image("collection/mokhwa-dangui-model-2", "목화문 당의 뒷태", 3 / 4),
      ],
      notes: [
        "모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다.",
        "사이즈는 제작 과정에서 1~2cm의 오차가 있을 수 있습니다.",
      ],
    },
  },
  {
    id: "durumagi",
    name: "남성 두루마기 예복",
    category: "남성 예복",
    material: "본견(실크)",
    description:
      "정갈한 선의 남성 두루마기. 격식과 편안함을 함께 담았습니다.",
    price: 0,
    image: image("collection/durumagi", "남성 두루마기 예복", 3 / 4),
    isBest: true,
    tags: ["두루마기", "남성", "예식"],
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
    detail: {
      subtitle: "周衣",
      tagline: "차분한 위엄을 담은 남성 예복",
      intro: "곧은 선과 단정한 고름으로\n차분한 위엄을 완성하는 두루마기입니다.",
      highlight: {
        title: "두루마기, 남성 예복의 정점",
        body: "두루마기는 겉옷의 정점으로, 남성 예복의 격을 완성합니다. 어깨에서 도련으로 이어지는 곧은 선과 단정한 고름이 차분한 위엄을 만듭니다.",
        image: image(
          "collection/durumagi-detail",
          "두루마기 고름 디테일",
          4 / 3,
        ),
      },
      features: [
        {
          title: "단정한 고름 여밈",
          body: "예를 갖추는 자리를 위한 단정한 고름 여밈이 차분한 인상을 완성합니다.",
          image: image(
            "collection/durumagi-goreum",
            "두루마기 고름 클로즈업",
            4 / 3,
          ),
        },
        {
          title: "곧은 선의 실루엣",
          body: "어깨에서 도련으로 이어지는 곧은 선이 단정하고 위엄 있는 실루엣을 만듭니다.",
          image: image(
            "collection/durumagi-line",
            "두루마기 실루엣",
            4 / 3,
          ),
        },
        {
          title: "편안한 본견의 감촉",
          body: "본견의 은은한 광택과 부드러운 촉감으로 예를 갖추되, 몸을 편안하게 감쌉니다.",
          image: image(
            "collection/durumagi-fabric",
            "두루마기 본견 원단",
            4 / 3,
          ),
        },
      ],
      modelShots: [
        image("collection/durumagi-model-1", "남성 두루마기 예복 정면", 3 / 4),
        image("collection/durumagi-model-2", "남성 두루마기 예복 뒷태", 3 / 4),
      ],
      notes: [
        "모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다.",
        "사이즈는 제작 과정에서 1~2cm의 오차가 있을 수 있습니다.",
      ],
    },
  },
];
