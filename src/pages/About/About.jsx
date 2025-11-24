import { useState, useEffect } from 'react'
import AboutTabs from './AboutTabs';
import SubNavBar from '../../componets/SubNavBar/SubNavBar';

// 날짜 문자열을 Date 객체로 변환 (YYYY.MM.DD 또는 YYYY.MM.DD(...) 형식)
const parseDate = (dateStr) => {
    const match = dateStr.match(/\d{4}\.\d{2}\.\d{2}/);
    return match ? new Date(match[0].replace(/\./g, "-")) : new Date(0); // 실패 시 옛날 날짜로
  };

function About(){
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("Home");
    const projectTabs = ["Home", "논문", "수상경력", "자격증"];

    useEffect(() => {
      fetch(`${import.meta.env.BASE_URL}db.json`)
        .then((res) => res.json())
        .then((json) => {
          const sorted = {};
  
          for (const [category, items] of Object.entries(json)) {
            const itemArray = Object.values(items);
  
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
  
    if (!data) return <p>로딩 중...</p>;
    return(
        <div>
          <SubNavBar tabs={projectTabs} currentTab={tab} setCurrentTab={setTab} currentPage={"소개"} />
          <AboutTabs data={data} tab={tab}/>
        </div>
    )
}

export default About;