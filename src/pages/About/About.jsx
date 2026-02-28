import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import AboutTabs from './AboutTabs';
import SubNavBar from '../../componets/SubNavBar/SubNavBar';

// URL 경로(tabId)와 실제 탭 이름 간의 매핑
const TAB_MAPPING = {
  "intro": "자기소개",
  "paper": "논문",
  "award": "수상경력",
  "cert": "자격증"
};
const REVERSE_TAB_MAPPING = {
  "자기소개": "intro",
  "논문": "paper",
  "수상경력": "award",
  "자격증": "cert"
};

const projectTabs = ["자기소개", "논문", "수상경력", "자격증"];

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

  // URL 파라미터가 유효하지 않으면 기본값 사용
  const currentTab = TAB_MAPPING[tabId] || "자기소개";

  // 잘못된 경로명 입력 시 intro로 리다이렉트
  useEffect(() => {
    if (tabId && !TAB_MAPPING[tabId]) {
      navigate('/about/intro', { replace: true });
    }
  }, [tabId, navigate]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}db.json`)
      .then((res) => res.json())
      .then((json) => {
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
      })
      .catch((err) => console.error("불러오기 실패:", err));
  }, []);

  const handleTabChange = (newTabName) => {
    const routeId = REVERSE_TAB_MAPPING[newTabName];
    if (routeId) {
      navigate(`/about/${routeId}`);
    }
  };

  if (!data) return <p>로딩 중...</p>;
  return (
    <div>
      <SubNavBar tabs={projectTabs} currentTab={currentTab} setCurrentTab={handleTabChange} currentPage={"소개"} />
      <AboutTabs data={data} tab={currentTab} />
    </div>
  )
}

export default About;