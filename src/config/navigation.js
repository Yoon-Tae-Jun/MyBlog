/**
 * 소개 탭의 단일 출처.
 * About.jsx의 탭 목록과 검색 노출 문구를 여기서만 관리한다.
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
