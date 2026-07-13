import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { image } from "./image";

/** 룩북 갤러리 정적 데이터. aspectRatio로 메이슨리 높이가 흐른다. */
export const galleryData: readonly GalleryItem[] = [
  {
    id: "g1",
    image: image("gallery/01", "실크 슬립 원피스 착장", 3 / 4),
    caption: "Slip Dress",
    span: "tall",
  },
  {
    id: "g2",
    image: image("gallery/02", "실크 블라우스 소매 디테일", 4 / 3),
    caption: "Blouse Detail",
    span: "wide",
  },
  {
    id: "g3",
    image: image("gallery/03", "실크 스카프 스타일링", 1),
    caption: "Scarf Styling",
    span: "normal",
  },
  {
    id: "g4",
    image: image("gallery/04", "실크의 광택과 결", 1),
    caption: "Luster",
    span: "normal",
  },
  {
    id: "g5",
    image: image("gallery/05", "와이드 셋업 착장", 3 / 4),
    caption: "Wide Set",
    span: "tall",
  },
  {
    id: "g6",
    image: image("gallery/06", "실크 파자마 세트", 1),
    caption: "Loungewear",
    span: "normal",
  },
  {
    id: "g7",
    image: image("gallery/07", "롱 실크 로브 실루엣", 4 / 3),
    caption: "Long Robe",
    span: "wide",
  },
  {
    id: "g8",
    image: image("gallery/08", "실크 원단 클로즈업", 1),
    caption: "Fabric",
    span: "normal",
  },
];
