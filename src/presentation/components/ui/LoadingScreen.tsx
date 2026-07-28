import Image from "next/image";

/**
 * 전역 로딩 화면.
 *
 * 뷰포트를 가득 덮어(헤더·푸터 포함) 브랜드 엠블럼만 보여준다.
 * `loding.png`는 크림 종이 질감이 통째로 구워진 정사각 이미지라,
 * 배경을 그 종이색(#e5e2de, 우하단 비네팅 #dbd8d3)과 잇는 방사형 그라디언트로 깔아
 * 이미지 경계가 드러나지 않게 한다. (사이트 기본 --color-ivory #f3ece0 는 더 따뜻해서 이음새가 보인다)
 */
export function LoadingScreen() {
  return (
    <div
      // aria-live 로 상태를 알리고, 이미지 자체는 장식으로 처리해 중복 안내를 막는다.
      role="status"
      aria-live="polite"
      // SiteHeader가 sticky z-50, 모바일 메뉴가 z-40 이므로 그 위를 확실히 덮는다.
      className="fixed inset-0 z-60 grid place-items-center"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #e8e5e1 0%, #e5e2de 45%, #dbd8d3 100%)",
      }}
    >
      <div className="animate-silk-breath relative aspect-square w-[min(78vw,78vh,560px)]">
        <Image
          src="/loding.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 78vw, 560px"
          className="object-contain"
        />
      </div>
      <span className="sr-only">페이지를 불러오는 중입니다</span>
    </div>
  );
}
