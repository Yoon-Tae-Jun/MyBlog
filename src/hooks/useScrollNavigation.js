import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = ['/', '/about/intro', '/about/paper', '/about/award', '/about/cert', '/projects'];

export const useScrollNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRouting = useRef(false);

    useEffect(() => {
        // 휠 이벤트 핸들러
        const handleWheel = (e) => {
            // 라우팅 쿨타임 중이면 무시
            if (isRouting.current) return;

            const currentIndex = routes.indexOf(location.pathname);
            // 지정된 라우트가 아니면 무시
            if (currentIndex === -1) return;

            // 트랙패드 및 마우스 휠 민감도 고려
            const isScrollDown = e.deltaY > 30;
            const isScrollUp = e.deltaY < -30;

            const scrollY = window.scrollY;
            const innerHeight = window.innerHeight;
            const offsetHeight = document.body.offsetHeight;

            if (isScrollDown) {
                // [아래로 스크롤] 현재 페이지의 스크롤이 가장 아래에 도달했는지 확인
                const isBottom = innerHeight + scrollY >= offsetHeight - 10;

                if (isBottom && currentIndex < routes.length - 1) {
                    isRouting.current = true;
                    navigate(routes[currentIndex + 1]);
                    window.scrollTo(0, 0); // 새 페이지 갈 땐 최상단으로
                    setTimeout(() => { isRouting.current = false; }, 1000); // 연속 이동 방지
                }
            } else if (isScrollUp) {
                // [위로 스크롤] 현재 페이지의 스크롤이 가장 위에 도달했는지 확인
                const isTop = scrollY <= 10;

                if (isTop && currentIndex > 0) {
                    isRouting.current = true;
                    navigate(routes[currentIndex - 1]);
                    // 이전 페이지로 갈 때도 맨 위에서 시작
                    setTimeout(() => { window.scrollTo(0, 0); }, 50);
                    setTimeout(() => { isRouting.current = false; }, 1000);
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [location.pathname, navigate]);
};

// App.jsx에서 라우터 하위에 선언하기 위한 Wrapper 컴포넌트
export function ScrollHandler() {
    useScrollNavigation();
    return null;
}
