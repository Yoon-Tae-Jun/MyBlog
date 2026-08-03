import { useLayoutEffect } from "react";

/** 한 구역을 넘어가는 데 걸리는 시간 */
const DURATION = 750;
/** 휠이 이만큼 잠잠해져야 다음 이동을 받는다 (트랙패드 관성 꼬리를 흘려보낸다) */
const IDLE_GAP = 160;
/** 정차 지점과 이 정도 차이는 같은 자리로 본다 */
const TOLERANCE = 4;

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const maxScrollY = () =>
  Math.max(
    0,
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight
  );

/** :root에 정의된 nav 높이를 읽는다 (좁은 화면에서 값이 달라진다) */
function navHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
  return parseFloat(raw) || 0;
}

let animationFrame = null;

/** 진행 중인 이동을 멈춘다. 사용자가 직접 스크롤하면 즉시 손을 뗀다. */
export function cancelScrollAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

/**
 * 목표 위치까지 직접 그려가며 이동한다.
 * 브라우저 기본 smooth는 속도·이징을 정할 수 없어서 직접 굴린다.
 */
export function animateScrollTo(targetY, { duration = DURATION, onDone } = {}) {
  cancelScrollAnimation();

  const startY = window.scrollY;
  const distance = Math.min(maxScrollY(), Math.max(0, targetY)) - startY;

  if (prefersReducedMotion() || Math.abs(distance) < 1) {
    window.scrollTo(0, startY + distance);
    onDone?.();
    return;
  }

  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
      return;
    }

    animationFrame = null;
    onDone?.();
  };

  animationFrame = requestAnimationFrame(step);
}

/** 커서 아래에 따로 스크롤되는 영역이 있으면 그쪽에 양보한다. */
function scrollableAncestor(target, deltaY) {
  let el = target instanceof Element ? target : null;

  while (el && el !== document.body && el !== document.documentElement) {
    const style = getComputedStyle(el);
    const scrolls =
      /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;

    if (scrolls) {
      const roomAbove = deltaY < 0 && el.scrollTop > 0;
      const roomBelow =
        deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      if (roomAbove || roomBelow) return el;
    }

    el = el.parentElement;
  }

  return null;
}

/** 파이어폭스는 줄, 일부 환경은 페이지 단위로 델타를 준다. */
function normalizeWheelDelta(event) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/**
 * 휠 한 번에 구역 하나씩, 우리가 정한 이징으로 넘어가게 한다.
 *
 * CSS scroll-snap 대신 직접 움직이는 이유:
 * mandatory 스냅은 이동 곡선을 브라우저가 정해서 뚝 끊기는 느낌이 나고,
 * 스크롤을 코드로 움직이는 다른 동작(메뉴 이동 등)과도 서로 잡아당긴다.
 *
 * 좁은 화면과 모션 최소화 설정에서는 아무것도 하지 않고 평소 스크롤에 맡긴다.
 */
export function useSectionScroll(selector = ".home-section") {
  useLayoutEffect(() => {
    const wide = window.matchMedia("(min-width: 901px)");

    let locked = false;
    let idleTimer = 0;

    const releaseWhenIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        locked = false;
      }, IDLE_GAP);
    };

    /** 구역들의 정차 지점. 마지막에는 푸터를 볼 수 있도록 문서 끝도 넣는다. */
    const stops = () => {
      const offset = navHeight();
      const limit = maxScrollY();

      const list = Array.from(document.querySelectorAll(selector)).map((el) =>
        Math.max(0, Math.min(limit, Math.round(el.getBoundingClientRect().top + window.scrollY - offset)))
      );

      const last = list[list.length - 1] ?? 0;
      if (limit - last > 40) list.push(limit);

      return list;
    };

    const goTo = (direction) => {
      const list = stops();
      const current = window.scrollY;

      const target =
        direction > 0
          ? list.find((y) => y > current + TOLERANCE)
          : list.filter((y) => y < current - TOLERANCE).pop();

      if (target === undefined) return false;

      locked = true;
      animateScrollTo(target, { onDone: releaseWhenIdle });
      return true;
    };

    const onWheel = (event) => {
      if (!wide.matches || prefersReducedMotion()) return;
      // 확대(ctrl+휠)나 가로 스크롤은 건드리지 않는다
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      // 모바일 메뉴처럼 배경을 잠근 상태
      if (document.body.style.overflow === "hidden") return;
      if (scrollableAncestor(event.target, event.deltaY)) return;

      const delta = normalizeWheelDelta(event);
      if (!delta) return;

      event.preventDefault();

      // 이동 중이거나 관성 꼬리가 남아 있으면 흘려보낸다
      if (locked) {
        releaseWhenIdle();
        return;
      }

      goTo(delta > 0 ? 1 : -1);
    };

    const onKeyDown = (event) => {
      if (!wide.matches || prefersReducedMotion()) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) {
        return;
      }

      if (event.key === "PageDown" || event.key === "PageUp") {
        if (goTo(event.key === "PageDown" ? 1 : -1)) event.preventDefault();
        return;
      }

      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        locked = true;
        animateScrollTo(event.key === "Home" ? 0 : maxScrollY(), {
          onDone: releaseWhenIdle,
        });
      }
    };

    // 스크롤바를 끌거나 터치로 직접 움직이면 진행 중인 이동은 접는다
    const onManualScroll = () => {
      cancelScrollAnimation();
      clearTimeout(idleTimer);
      locked = false;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onManualScroll, { passive: true });
    window.addEventListener("touchstart", onManualScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onManualScroll);
      window.removeEventListener("touchstart", onManualScroll);
      clearTimeout(idleTimer);
      cancelScrollAnimation();
    };
  }, [selector]);
}
