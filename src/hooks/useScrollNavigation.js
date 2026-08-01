import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SCROLL_ROUTES } from "../config/navigation";

/** 페이지 끝에 닿은 뒤 이만큼 더 굴려야 다음 페이지로 넘어간다. */
const THRESHOLD = 160;
/** 이동 직후 연속 이동을 막는 시간 */
const COOLDOWN = 650;
/** 이 시간 동안 휠이 멈추면 굴린 양을 초기화한다 (한 번의 동작으로 취급) */
const IDLE_RESET = 250;

/** deltaMode(픽셀/줄/페이지)를 픽셀 기준으로 맞춘다. 파이어폭스는 줄 단위를 쓴다. */
function toPixels(e) {
  if (e.deltaMode === 1) return e.deltaY * 16;
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
  return e.deltaY;
}

export const useScrollNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locked = useRef(false);
  const accumulated = useRef(0);
  const lastEventAt = useRef(0);

  // 경로가 바뀌면 항상 맨 위에서 시작한다 (메뉴 클릭으로 이동할 때도 동일)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const index = SCROLL_ROUTES.indexOf(location.pathname);
    if (index === -1) return;

    // 페이지가 바뀌었으니 이전 페이지에서 굴린 양은 버린다
    accumulated.current = 0;

    const go = (nextIndex) => {
      locked.current = true;
      accumulated.current = 0;
      // React Router가 DOM 교체를 View Transition으로 감싸 크로스페이드시킨다.
      // 미지원 브라우저에서는 옵션이 무시되고 즉시 전환된다.
      navigate(SCROLL_ROUTES[nextIndex], { viewTransition: true });
      window.setTimeout(() => {
        locked.current = false;
      }, COOLDOWN);
    };

    const handleWheel = (e) => {
      if (locked.current) return;

      // 모바일 메뉴처럼 배경 스크롤을 잠근 상태에서는 동작하지 않는다
      if (document.body.style.overflow === "hidden") return;

      const now = performance.now();
      if (now - lastEventAt.current > IDLE_RESET) accumulated.current = 0;
      lastEventAt.current = now;

      const delta = toPixels(e);
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + Math.ceil(window.scrollY) >= doc.scrollHeight - 2;
      const atTop = window.scrollY <= 2;

      const goingDown = delta > 0 && atBottom && index < SCROLL_ROUTES.length - 1;
      const goingUp = delta < 0 && atTop && index > 0;

      // 페이지 안에서 아직 스크롤할 여지가 있으면 평소대로 스크롤하게 둔다
      if (!goingDown && !goingUp) {
        accumulated.current = 0;
        return;
      }

      accumulated.current += delta;

      if (Math.abs(accumulated.current) >= THRESHOLD) {
        go(index + (accumulated.current > 0 ? 1 : -1));
      }
    };

    // preventDefault를 쓰지 않으므로 passive로 등록한다.
    // (기존에는 passive:false 라서 매 휠마다 브라우저가 핸들러 종료를 기다렸다)
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [location.pathname, navigate]);
};

// App.jsx에서 라우터 하위에 선언하기 위한 Wrapper 컴포넌트
export function ScrollHandler() {
  useScrollNavigation();
  return null;
}
