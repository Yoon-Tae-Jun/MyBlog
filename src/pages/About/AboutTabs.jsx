import React from "react";
import './AboutTabs.css';
function AboutTabs({ data, tab }) {
    if (tab === "Home") {
        const blocks = data["Home"] || [];
    
        return (
          <div className="about-container">
            <div className="about-content-wrapper">
              <div className="about-home">
                {blocks.map((block) => renderIntroBlock(block))}
              </div>
            </div>
          </div>
        );
    }

    const items = data[tab] || [];
    
    return (
        <div className="about-container">
        <div className="about-content-wrapper">
            <ul>
                {items.map((item, idx) => (
                    <li className="card-container" key={idx}>
                        {tab === "논문" && (
                            <PaperCard item={item}/>
                        )}
                        {tab === "수상경력" && (
                            <ContestCard item={item}/>
                        )}
                        {tab === "자격증" && (
                            <CertificationCard item={item}/>
                        )}
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
}

/* =========================
   Home 탭(소개) 렌더링 부분
   ========================= */
   function renderIntroBlock(block) {
    if (!block) return null;
  
    const type = block.type;
  
    /* ------------------------
       1) 제목 (heading 계열)
       ------------------------ */
    if (type === "heading_1") {
      const text = (block.heading_1?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <h1 key={block.id} className="intro-heading intro-h1">
          {text}
        </h1>
      );
    }
  
    if (type === "heading_2") {
      const text = (block.heading_2?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <h2 key={block.id} className="intro-heading intro-h2">
          {text}
        </h2>
      );
    }
  
    if (type === "heading_3") {
      const text = (block.heading_3?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <h3 key={block.id} className="intro-heading intro-h3">
          {text}
        </h3>
      );
    }
  
    /* ------------------------
       2) 글머리표 리스트
       ------------------------ */
    if (type === "bulleted_list_item") {
      const text = (block.bulleted_list_item?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <p key={block.id} className="intro-bullet">
            <span className="intro-bullet-dot">•</span>
            <span>{text}</span>
        </p>
      );
    }
  
    if (type === "numbered_list_item") {
      const text = (block.numbered_list_item?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <p key={block.id} className="intro-bullet">
            <span className="intro-bullet-dot">•</span>
            <span>{text}</span>
      </p>
      );
    }
  
    /* ------------------------
       3) 일반 문단
       ------------------------ */
    if (type === "paragraph") {
      const rt = block.paragraph?.rich_text || [];
      const text = rt.map((t) => t.plain_text).join("");
      if (!text) return null;
      return (
        <p key={block.id} className="intro-paragraph">
          {text}
        </p>
      );
    }
  
    /* ------------------------
       4) 이미지
       ------------------------ */
    if (type === "image") {
      const name = block.image?.name;
      if (!name) return null;
  
      return (
        <div key={block.id} className="intro-image-wrapper">
          <img
            className="intro-image"
            src={`${import.meta.env.BASE_URL}page_img/${encodeURIComponent(name)}`}
            alt=""
          />
        </div>
      );
    }
  
    /* ------------------------
       5) column_list (좌우 배치)
       ------------------------ */
    if (type === "column_list") {
      const columns = block.children || [];
      return (
        <div key={block.id} className="intro-columns">
          {columns.map((col) => (
            <div key={col.id} className="intro-column">
              {(col.children || []).map((child) => renderIntroBlock(child))}
            </div>
          ))}
        </div>
      );
    }
  
    /* ------------------------
       6) divider
       ------------------------ */
    if (type === "divider") {
      return <hr key={block.id} className="intro-divider" />;
    }
  
    /* ------------------------
       7) quote
       ------------------------ */
    if (type === "quote") {
      const text = (block.quote?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      return (
        <blockquote key={block.id} className="intro-quote">
          {text}
        </blockquote>
      );
    }
  
    /* ------------------------
       8) to_do
       ------------------------ */
    if (type === "to_do") {
      const text = (block.to_do?.rich_text || [])
        .map(t => t.plain_text)
        .join("");
      const checked = block.to_do?.checked;
      return (
        <div key={block.id} className="intro-todo">
          <input type="checkbox" checked={checked} readOnly />
          <span>{text}</span>
        </div>
      );
    }
  
    /* ------------------------
       9) fallback
       ------------------------ */
    return null;
  }
  


function PaperCard({ item }) {
    return (
          <div className="paper-card-content">
            <div className="paper-card-text">
              <strong>{item.paperName}</strong> <br />
              <span>{item.author.join(", ")}</span> <br />
              <span>{item.conferenceName}</span>, &nbsp;
              <span>{item.date}</span> <br />
            </div>
            <a
              className="paper-download-link"
              href={`${import.meta.env.BASE_URL}/papers/${encodeURIComponent(item.file)}`}
              download
            >
              📎 다운로드
            </a>
          </div>
    );
}

function ContestCard({ item }){
    return(
        <div className="award-card-content">
            <strong>{item.contestName}</strong> <br />
            <span>{item.awardType}</span>, &nbsp;
            <span>{item.date}</span>
        </div> 
    )
}

function CertificationCard({item}){
    return(
        <div className="cert-card-content">
            <strong>{item.CertificationName}</strong> <br />
            <span>{item.date}</span>
        </div>
    )
}
export default AboutTabs;