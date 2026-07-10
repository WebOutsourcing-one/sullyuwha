import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { image } from "./image";

/** 갤러리 정적 데이터. span으로 메이슨리 배치를 힌트한다. */
export const galleryData: readonly GalleryItem[] = [
  {
    id: "g1",
    image: image("gallery/01", "한옥 마당에서의 한복 착장", 3 / 4),
    caption: "봄, 마당에서",
    span: "tall",
  },
  {
    id: "g2",
    image: image("gallery/02", "저고리 깃과 동정 디테일", 4 / 3),
    caption: "깃과 동정",
    span: "wide",
  },
  {
    id: "g3",
    image: image("gallery/03", "고름을 매는 손", 1),
    caption: "고름을 매다",
    span: "normal",
  },
  {
    id: "g4",
    image: image("gallery/04", "치마의 주름과 결", 1),
    caption: "치마의 결",
    span: "normal",
  },
  {
    id: "g5",
    image: image("gallery/05", "전통 자수 디테일", 3 / 4),
    caption: "모란 자수",
    span: "tall",
  },
  {
    id: "g6",
    image: image("gallery/06", "노리개 장신구", 1),
    caption: "노리개",
    span: "normal",
  },
  {
    id: "g7",
    image: image("gallery/07", "대청마루의 한복", 4 / 3),
    caption: "대청마루에서",
    span: "wide",
  },
  {
    id: "g8",
    image: image("gallery/08", "은은한 빛의 옷감", 1),
    caption: "빛과 옷감",
    span: "normal",
  },
];
