# 윤태준 포트폴리오 (MyBlog)

주소: **https://taejun.dev**

React + Vite로 만든 포트폴리오 프론트엔드. 소개·논문·수상경력·프로젝트 내용은
노션에 적고, [Portfolio API](../Server)(FastAPI)가 내려 주는 값을 그대로 그린다.
화면 문구를 고치려고 코드를 건드릴 일은 없다.

## 구조

```
src/main.jsx          진입점
src/App.jsx           라우팅, 배경(별), 고정 nav + 푸터
src/api.js            /api/content 를 한 번 받아 캐시해 두고 모든 페이지가 공유
src/pages/            Home, About, Projects, ProjectDetail, NotFound
src/componets/        NavBar, Footer, SubNavBar, ThemeToggle, ProjectCover, State
src/hooks/            테마·구역 스크롤·등장 연출·페이지 메타
src/config/           소개 탭 목록 (단일 출처)
public/               favicon, og-image, robots.txt, sitemap.xml
```

## 경로

| 경로 | 화면 |
|---|---|
| `/` | 홈 — hero → 소개 → 논문·수상 → 프로젝트 → 연락처가 한 페이지로 이어진다 |
| `/about/:tabId` | 소개 / 논문 / 수상경력 탭 (`/about` 은 `/about/intro` 로 보낸다) |
| `/projects` | 프로젝트 목록 |
| `/projects/:id` | 프로젝트 상세 (노션 블록 렌더링) |
| 그 외 | 404 |

홈의 각 구역은 `top`, `about`, `highlights`, `work`, `contact` 라는 id를 가진다.
상단 메뉴는 홈에서 이 구역으로 스크롤하고, 다른 페이지에서는 원래 주소로 이동한다.

## 훅

| 파일 | 하는 일 |
|---|---|
| `useTheme.js` | 라이트/다크 전환, 로컬스토리지 저장, 주소창 색 동기화 |
| `useSectionScroll.js` | 홈에서 휠 한 번에 한 구역씩 이동 (이징을 직접 그린다) |
| `useReveal.js` | `[data-reveal]` 요소가 화면에 들어오면 나타나는 연출 |
| `useScrollToTop.js` | 경로가 바뀌면 항상 맨 위에서 시작 |
| `usePageMeta.js` | 페이지별 title / description / canonical 갱신 |

첫 화면이 번쩍이지 않도록 테마는 React가 뜨기 전 `index.html` 인라인 스크립트에서 정한다.
페이지 전환은 View Transitions API를 쓰고, 미지원 브라우저에는 CSS 대체 연출이 걸린다.
`prefers-reduced-motion` 을 켠 환경에서는 구역 스크롤과 등장 연출을 끈다.

## 개발

```bash
npm install
npm run dev        # http://localhost:5173 (--host 라 같은 망의 기기에서도 접속된다)
npm run lint
npm run build      # dist/
npm run preview
```

개발 서버는 `/api`, `/page_img`, `/papers` 를 프록시한다 (`vite.config.js`).
`/api` 는 로컬 FastAPI(127.0.0.1:8000)로, 이미지와 논문 PDF는 운영 서버로 보낸다.
로컬 백엔드를 띄우지 않으려면 `VITE_API_BASE=https://taejun.dev/api` 로 실행하면 된다.

## 배포

nginx가 이 저장소의 `dist/` 를 정적으로 서빙한다. 빌드하면 바로 반영된다.

```bash
npm run build
```

| 경로 | 처리 |
|---|---|
| `/` | `dist/` — SPA라 없는 주소는 `index.html` 로 넘긴다 |
| `/api/` | `127.0.0.1:8000` (FastAPI) |
| `/page_img/`, `/papers/` | `../Server/data/` 에서 직접 서빙 |

`dist/` 는 커밋하지 않는다 (`.gitignore`).

## 연락처

- 이메일: yytaejun@gmail.com
- GitHub: https://github.com/Yoon-Tae-Jun
- 블로그: https://tae-jun.tistory.com/
