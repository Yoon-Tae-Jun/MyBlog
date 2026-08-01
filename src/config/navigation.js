/**
 * 소개 탭과 스크롤 이동 순서의 단일 출처.
 *
 * 예전에는 About.jsx의 탭 목록과 스크롤 경로 목록이 따로 있어서,
 * 자격증 탭을 주석 처리했을 때 스크롤만 /about/cert 로 이동해
 * 곧바로 /about/intro 로 튕기는 문제가 있었다. 여기서만 관리한다.
 */
export const ABOUT_TABS = [
  {
    id: "intro",
    name: "자기소개",
    title: "소개",
    description: "Edge AI와 컴퓨터 비전을 연구하는 윤태준을 소개합니다.",
  },
  {
    id: "paper",
    name: "논문",
    title: "논문",
    description: "윤태준이 참여한 학회 논문과 발표 자료 목록입니다.",
  },
  {
    id: "award",
    name: "수상경력",
    title: "수상경력",
    description: "윤태준의 공모전 및 경진대회 수상 내역입니다.",
  },
  // 자격증 탭을 열 때 아래 주석을 해제하면 스크롤 순서에도 자동 반영된다.
  // {
  //   id: "cert",
  //   name: "자격증",
  //   title: "자격증",
  //   description: "윤태준이 취득한 자격증 목록입니다.",
  // },
];

/** 휠 스크롤로 오갈 수 있는 페이지 순서 */
export const SCROLL_ROUTES = [
  "/",
  ...ABOUT_TABS.map((t) => `/about/${t.id}`),
  "/projects",
];
