import { useState, useEffect } from 'react'
import SubNavBar from '../../componets/SubNavBar/SubNavBar';
// 날짜 문자열을 Date 객체로 변환 (YYYY.MM.DD 또는 YYYY.MM.DD(...) 형식)
const parseDate = (dateStr) => {
    const match = dateStr.match(/\d{4}\.\d{2}\.\d{2}/);
    return match ? new Date(match[0].replace(/\./g, "-")) : new Date(0); // 실패 시 옛날 날짜로
  };

function Home(){
    return(
        <div>
            Home
        </div>
    )
}

export default Home;