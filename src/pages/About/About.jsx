import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import AboutTabs from './AboutTabs';
import SubNavBar from '../../componets/SubNavBar/SubNavBar';
import { fetchContent } from '../../api';
import { TextSkeleton, ErrorState } from '../../componets/State/State';
import { usePageMeta } from '../../hooks/usePageMeta';
import './About.css';

// URL 경로(tabId)와 실제 탭 이름 간의 매핑
const TAB_MAPPING = {
  "intro": "자기소개",
  "paper": "논문",
  "award": "수상경력",
  //"cert": "자격증"
};
const REVERSE_TAB_MAPPING = {
  "자기소개": "intro",
  "논문": "paper",
  "수상경력": "award",
  //"자격증": "cert"
};

/* 추후 자격증 추가 */
const projectTabs = ["자기소개", "논문", "수상경력"];

// 탭별 검색 노출용 문구
const TAB_META = {
  "자기소개": {
    title: "소개",
    description: "Edge AI와 컴퓨터 비전을 연구하는 윤태준을 소개합니다.",
  },
  "논문": {
    title: "논문",
    description: "윤태준이 참여한 학회 논문과 발표 자료 목록입니다.",
  },
  "수상경력": {
    title: "수상경력",
    description: "윤태준의 공모전 및 경진대회 수상 내역입니다.",
  },
  "자격증": {
    title: "자격증",
    description: "윤태준이 취득한 자격증 목록입니다.",
  },
};

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

function About() {
  const { tabId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
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
    let cancelled = false;
    setStatus("loading");

    fetchContent()
      .then((json) => {
        if (cancelled) return;
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
          itemArray.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA;
          });

          sorted[category] = itemArray;
        }

        setData(sorted);
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
  }, [reloadKey]);

  const handleTabChange = (newTabName) => {
    const routeId = REVERSE_TAB_MAPPING[newTabName];
    if (routeId) {
      navigate(`/about/${routeId}`);
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
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        </div>
      )}

      {status === "ready" && <AboutTabs data={data} tab={currentTab} />}
    </div>
  )
}

export default About;