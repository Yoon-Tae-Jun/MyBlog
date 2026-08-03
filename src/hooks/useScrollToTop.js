import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 경로가 바뀌면 항상 맨 위에서 시작한다.
 *
 * 예전에는 여기에 휠 가로채기가 함께 있었다. 페이지 끝에서 휠을 더 굴리면
 * 라우트를 통째로 바꾸는 방식이었는데, 스크롤이 이어지지 않고 화면이 한 번
 * 끊겨 보여서 걷어냈다. 지금은 홈 한 페이지를 그냥 쭉 내려 읽는다.
 */
export function useScrollToTop() {
  const location = useLocation();

  // 화면이 그려지기 전에 올려 두어야 이전 페이지의 스크롤 위치가 잠깐 비치지 않는다
  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    // View Transitions로 화면을 바꾸는 동안 브라우저가 위치를 되돌려 놓는 경우가
    // 있어, 전환이 끝난 다음 프레임에 한 번 더 맞춘다.
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);
}

// App.jsx에서 라우터 하위에 선언하기 위한 Wrapper 컴포넌트
export function ScrollHandler() {
  useScrollToTop();
  return null;
}
