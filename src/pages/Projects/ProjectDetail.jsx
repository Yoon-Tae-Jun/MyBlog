import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}db.json`)
      .then((res) => res.json())
      .then((data) => {
        const rawProjects = data["프로젝트"] || {};
        if (rawProjects[id]) {
          const item = rawProjects[id];
          const tags = item.tag || [];
          setProject({
            id,
            title: item.ProjectName || item.description,
            description: item.description,
            tags,
            status: item.status,
            blocks: item.blocks || [],
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("db.json 로드 실패:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="project-detail-page"><div className="project-detail-inner">Loading...</div></div>;
  }

  if (!project) {
    return <div className="project-detail-page"><div className="project-detail-inner">Project not found.</div></div>;
  }

  return (
    <div className="project-detail-page">
      <div className="project-detail-inner fade-in-up">
        {/* 상단 버튼 & 제목 영역 */}
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          ← Back to Projects
        </button>

        <header className="pd-header">
          <h1 className="pd-title">{project.title}</h1>
          <div className="pd-tags-container">
            <span
              className={`pd-status-badge ${
                project.status === "Completed"
                  ? "status-completed"
                  : project.status === "In Progress"
                  ? "status-in-progress"
                  : project.status === "Experimental"
                  ? "status-experimental"
                  : "status-other"
              }`}
            >
              {project.status}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="pd-meta-tag">{tag}</span>
            ))}
          </div>
        </header>

        {/* 상세 설명 (Notion Blocks) */}
        <div className="pd-content">
          {project.blocks.map((block) => renderBlock(block))}
        </div>
      </div>
    </div>
  );
}

// Notion Block Renderer for Project Detail
function renderBlock(block) {
  if (!block) return null;
  const type = block.type;

  if (type === "heading_1") {
    const text = (block.heading_1?.rich_text || []).map(t => t.plain_text).join("");
    return <h1 key={block.id} className="pd-block-h1">{text}</h1>;
  }
  if (type === "heading_2") {
    const text = (block.heading_2?.rich_text || []).map(t => t.plain_text).join("");
    return <h2 key={block.id} className="pd-block-h2">{text}</h2>;
  }
  if (type === "heading_3") {
    const text = (block.heading_3?.rich_text || []).map(t => t.plain_text).join("");
    return <h3 key={block.id} className="pd-block-h3">{text}</h3>;
  }
  if (type === "paragraph") {
    const text = (block.paragraph?.rich_text || []).map(t => t.plain_text).join("");
    if (!text) return null;
    return <p key={block.id} className="pd-block-p">{text}</p>;
  }
  if (type === "bulleted_list_item" || type === "numbered_list_item") {
    const text = (block[type]?.rich_text || []).map(t => t.plain_text).join("");
    const childrenBlocks = block.children || [];
    
    return (
      <div key={block.id} className="pd-block-bullet-container" style={{ marginLeft: "10px", marginTop: "8px", marginBottom: "8px" }}>
        <div className="pd-block-bullet" style={{ display: "flex", margin: 0 }}>
          <span className="pd-block-bullet-dot" style={{ marginRight: "12px", color: "#94a3b8" }}>
             {type === "bulleted_list_item" ? "•" : "-"}
          </span>
          <span className="pd-block-p" style={{ marginBottom: 0 }}>{text}</span>
        </div>
        {childrenBlocks.length > 0 && (
          <div className="pd-block-bullet-children" style={{ marginLeft: "20px" }}>
            {childrenBlocks.map((childBlock) => {
              // 2단 리스트일 경우 빈 동그라미로 트릭을 주거나,
              // 재귀적으로 renderBlock을 호출합니다.
              // 기본적으로 renderBlock에서 불릿을 다시 찍어주므로 들여쓰기만 주면 됩니다.
              // 만약 뷰 텍스트를 커스텀하고 싶다면 여기서 타입조작도 가능합니다.
              if (childBlock.type === "bulleted_list_item") {
                // 약간의 스타일링을 위해 자식 블록 처리
                const childText = (childBlock.bulleted_list_item?.rich_text || []).map(t => t.plain_text).join("");
                const grandChildren = childBlock.children || [];
                return (
                  <div key={childBlock.id} className="pd-block-bullet-container" style={{ marginTop: "4px", marginBottom: "4px" }}>
                    <div className="pd-block-bullet" style={{ display: "flex", margin: 0 }}>
                      <span className="pd-block-bullet-dot" style={{ marginRight: "12px", color: "#94a3b8" }}>◦</span>
                      <span className="pd-block-p" style={{ marginBottom: 0 }}>{childText}</span>
                    </div>
                    {grandChildren.length > 0 && (
                       <div style={{ marginLeft: "20px" }}>
                         {grandChildren.map(gc => renderBlock(gc))}
                       </div>
                    )}
                  </div>
                );
              }
              return renderBlock(childBlock);
            })}
          </div>
        )}
      </div>
    );
  }
  if (type === "image") {
    const name = block.image?.name;
    if (!name) return null;
    return (
      <div key={block.id} className="pd-block-image-wrapper">
        <img
          className="pd-block-image"
          src={`${import.meta.env.BASE_URL}page_img/${encodeURIComponent(name)}`}
          alt=""
        />
      </div>
    );
  }
  if (type === "quote") {
    const text = (block.quote?.rich_text || []).map(t => t.plain_text).join("");
    return <blockquote key={block.id} className="pd-block-quote">{text}</blockquote>;
  }
  if (type === "divider") {
    return <hr key={block.id} className="pd-block-divider" />;
  }
  if (type === "column_list") {
    const columns = block.children || [];
    return (
      <div key={block.id} style={{ display: 'flex', gap: '30px', margin: '20px 0' }}>
        {columns.map((col) => (
          <div key={col.id} style={{ flex: 1 }}>
            {(col.children || []).map((child) => renderBlock(child))}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default ProjectDetail;
