"use client";

import { useEffect } from "react";
import Image from "next/image";

/** 이번 세션에 인트로를 봤는지 기록하는 키. */
const SEEN_KEY = "sullyuwha:intro-seen";

/** 머무는 시간 · 걷히는 시간. globals.css의 `.intro-splash` 애니메이션과 맞춰둔다. */
const HOLD_MS = 2000;
const FADE_MS = 700;

/**
 * 페인트 전에 실행돼야 하는 게이트.
 *
 * 이미 본 세션이면 html에 표시를 남기고, globals.css가 그 표시를 보고 스플래시를
 * 아예 그리지 않는다. 하이드레이션을 기다렸다가 숨기면 이미 한 번 그려진 뒤라
 * 두 번째 방문마다 스플래시가 번쩍인다.
 */
const GATE_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)}))document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`;

/**
 * 홈 인트로 스플래시 — 모바일에서 첫 진입 시 엠블럼만 잠깐 띄웠다가 걷힌다.
 *
 * 로딩 인디케이터가 아니다. 페이지는 이미 뒤에 다 그려져 있고, 이 판이 2초간
 * 덮고 있다가 페이드아웃할 뿐이다. 그래서 실제 로딩 속도와 무관하게 길이가 일정하다.
 *
 * 페이드를 JS 타이머가 아니라 CSS 애니메이션으로 돌리는 이유는, 하이드레이션이
 * 늦어져도 인트로 길이가 늘어나지 않게 하기 위해서다. JS는 "이번 세션에 봤다"는
 * 기록만 담당한다.
 *
 * `placeholder.webp`는 크림 종이 질감이 통째로 구워진 정사각 이미지라, 배경을 그
 * 종이색(#e5e2de, 우하단 비네팅 #dbd8d3)과 잇는 방사형 그라디언트로 깔아 이미지
 * 경계가 드러나지 않게 한다. (사이트 기본 --color-ivory #f3ece0 는 더 따뜻해서 이음새가 보인다)
 */
export function IntroSplash() {
  useEffect(() => {
    const root = document.documentElement;
    // 게이트 스크립트가 이미 표시를 남겼다면 이번 세션에 본 것 — 손대지 않는다.
    if (root.hasAttribute("data-intro-seen")) return;

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* 프라이빗 모드 등에서 막히면 매번 보여주는 쪽으로 degrade */
    }

    // 인트로가 끝난 뒤에 표시를 남긴다. 클라이언트 이동으로 홈에 다시 와도
    // (문서가 새로 뜨지 않아 게이트 스크립트가 돌지 않으므로) 이 표시가 막아준다.
    const timer = setTimeout(
      () => root.setAttribute("data-intro-seen", ""),
      HOLD_MS + FADE_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <div
        // 콘텐츠는 뒤에 이미 다 있다. 장식용 덮개이므로 보조기기에는 숨긴다.
        aria-hidden
        // SiteHeader가 sticky z-50, 모바일 메뉴가 z-40 이므로 그 위를 확실히 덮는다.
        // touch-pinch-zoom: 덮여 있는 동안 뒤 페이지가 스크롤되는 것만 막고 확대는 남긴다.
        className="intro-splash fixed inset-0 z-60 grid touch-pinch-zoom place-items-center lg:hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #e8e5e1 0%, #e5e2de 45%, #dbd8d3 100%)",
        }}
      >
        <div className="animate-silk-breath relative aspect-square w-[min(78vw,78vh,560px)]">
          <Image
            src="/placeholder.webp"
            alt=""
            fill
            priority
            sizes="78vw"
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}
