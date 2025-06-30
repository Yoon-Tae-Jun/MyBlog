import React from "react";
import './AboutTabs.css';
function AboutTabs({ data, tab }) {
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

function CertificationCard(){
    return(
        <div className="cert-card-content">
            <strong>{item.CertificationName}</strong> <br />
            <span>{item.date}</span>
        </div>
    )
}
export default AboutTabs;