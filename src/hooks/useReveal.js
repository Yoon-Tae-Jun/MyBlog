import { useEffect, useRef } from "react";

/** 이 비율만큼 보이면 나타난 것으로 친다. */
const SHOW_RATIO = 0.15;

/**
 * 컨테이너 안의 [data-reveal] 요소가 화면에 들어오면 .is-revealed 를 붙이고,
 * 완전히 화면 밖으로 나가면 다시 떼어 둔다. 그래야 위로 되돌아왔다가
 * 다시 내려올 때도 똑같이 나타나는 연출이 재생된다.
 *
 * 요소마다 훅을 부르는 대신 컨테이너 하나만 관찰하는 이유는,
 * 목록이 API로 늦게 채워져도 deps만 바꿔 주면 다시 훑을 수 있기 때문이다.
 */
export function useRevealGroup(deps = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = root.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // 움직임을 줄여 달라고 했거나 관찰자를 못 쓰는 브라우저에서는 그냥 보여 준다
    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= SHOW_RATIO) {
            entry.target.classList.add("is-revealed");
          } else if (!entry.isIntersecting) {
            // 화면에 걸쳐 있는 동안 되돌리면 눈앞에서 사라져 버린다.
            // 완전히 빠져나갔을 때만 처음 상태로 돌려 둔다.
            entry.target.classList.remove("is-revealed");
          }
        });
      },
      { threshold: [0, SHOW_RATIO] }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
