import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import AboutTabs from './AboutTabs';
import SubNavBar from '../../componets/SubNavBar/SubNavBar';
import { fetchContent, getCachedContent, invalidateContent } from '../../api';
import { TextSkeleton, ErrorState } from '../../componets/State/State';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ABOUT_TABS } from '../../config/navigation';
import './About.css';

// 탭 정의는 config/navigation.js 한 곳에서 가져온다.
// (스크롤 이동 순서와 어긋나지 않게 하기 위함)
const TAB_MAPPING = Object.fromEntries(ABOUT_TABS.map((t) => [t.id, t.name]));
const REVERSE_TAB_MAPPING = Object.fromEntries(ABOUT_TABS.map((t) => [t.name, t.id]));
const projectTabs = ABOUT_TABS.map((t) => t.name);

// 탭별 검색 노출용 문구
const TAB_META = Object.fromEntries(
  ABOUT_TABS.map((t) => [t.name, { title: t.title, description: t.description }])
);

// 날짜 문자열을 Date 객체로 변환 (YYYY.MM.DD 또는 YYYY.MM 형식)
const parseDate = (dateStr) => {
  // 1. YYYY.MM.DD 형식 매칭 시도
  let match = dateStr.match(/\d{4}\.\d{2}\.\d{2}/);
  if (match) {
    return new Date(match[0].replace(/\./g, "-"));
  }

  // 2. YYYY.MM 형식 매칭 시도
  match = dateStr.match(/\d{4}\.\d{2}/);
  if (match) {
    return new Date(match[0].replace(/\./g, "-") + "-01");
  }

  return new Date(0); // 실패 시 옛날 날짜로
};

/** API 응답을 탭 이름별 배열로 정리한다. 날짜가 있는 항목은 최신순 정렬. */
function buildSections(json) {
  if (!json) return null;

  const sorted = {};
  for (const [category, items] of Object.entries(json)) {
    const itemArray = Object.values(items);

    if (category === "소개") {
      sorted["자기소개"] = itemArray;
      continue;
    }

    if (category === "프로젝트") {
      // 정렬 안 하고 그대로 사용
      sorted[category] = itemArray;
      continue;
    }

    // 날짜 기준 내림차순 정렬
    itemArray.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    sorted[category] = itemArray;
  }
  return sorted;
}

function About() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  // 이미 받아 둔 데이터가 있으면 로딩 화면을 거치지 않고 바로 그린다
  const [data, setData] = useState(() => buildSections(getCachedContent()));
  const [status, setStatus] = useState(() =>
    getCachedContent() ? "ready" : "loading"
  );
  const [reloadKey, setReloadKey] = useState(0);

  // URL 파라미터가 유효하지 않으면 기본값 사용
  const currentTab = TAB_MAPPING[tabId] || "자기소개";

  usePageMeta({
    ...TAB_META[currentTab],
    path: `/about/${REVERSE_TAB_MAPPING[currentTab]}`,
  });

  // 잘못된 경로명 입력 시 intro로 리다이렉트
  useEffect(() => {
    if (tabId && !TAB_MAPPING[tabId]) {
      navigate('/about/intro', { replace: true });
    }
  }, [tabId, navigate]);

  useEffect(() => {
    // 캐시로 이미 그려 둔 상태라면 다시 불러올 필요가 없다
    if (status === "ready" && data) return;

    let cancelled = false;

    fetchContent()
      .then((json) => {
        if (cancelled) return;
        setData(buildSections(json));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("불러오기 실패:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // reloadKey가 바뀌면(재시도) 위 조건을 지나 다시 요청한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const handleTabChange = (newTabName) => {
    const routeId = REVERSE_TAB_MAPPING[newTabName];
    if (routeId) {
      navigate(`/about/${routeId}`, { viewTransition: true });
    }
  };

  return (
    <div>
      <SubNavBar tabs={projectTabs} currentTab={currentTab} setCurrentTab={handleTabChange} currentPage={"소개"} />

      {status === "loading" && (
        <div className="about-state-wrapper">
          <TextSkeleton lines={8} />
        </div>
      )}

      {status === "error" && (
        <div className="about-state-wrapper">
          <ErrorState onRetry={() => { invalidateContent(); setStatus('loading'); setReloadKey((k) => k + 1); }} />
        </div>
      )}

      {status === "ready" && <AboutTabs data={data} tab={currentTab} />}
    </div>
  )
}

export default About;