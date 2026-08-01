import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchContent, imageUrl } from "../../api";
import { TextSkeleton, ErrorState } from "../../componets/State/State";
import { usePageMeta } from "../../hooks/usePageMeta";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  usePageMeta({
    title: project?.title,
    description: project?.description,
    path: `/projects/${id}`,
  });

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchContent()
      .then((data) => {
        if (cancelled) return;
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
        } else {
          setProject(null);
        }
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("프로젝트 상세 로드 실패:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  if (status === "loading") {
    return (
      <div className="project-detail-page">
        <div className="project-detail-inner">
          <TextSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="project-detail-page">
        <div className="project-detail-inner">
          <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-inner">
          <div className="state-box">
            <p className="state-title">프로젝트를 찾을 수 없습니다</p>
            <p className="state-desc">주소가 바뀌었거나 삭제된 프로젝트입니다.</p>
            <button className="state-button" onClick={() => navigate("/projects")}>
              프로젝트 목록으로
            </button>
          </div>
        </div>
      </div>
    );
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

/** 노션의 굵게/기울임/밑줄/코드/링크 서식을 그대로 살려서 렌더링한다. */
function RichText({ value = [] }) {
  return value.map((t, i) => {
    const a = t.annotations || {};
    let node = t.plain_text;

    if (a.code) node = <code className="pd-inline-code">{node}</code>;
    if (a.bold) node = <strong>{node}</strong>;
    if (a.italic) node = <em>{node}</em>;
    if (a.underline) node = <u>{node}</u>;
    if (a.strikethrough) node = <s>{node}</s>;

    if (t.href) {
      node = (
        <a className="pd-link" href={t.href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      );
    }

    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

const plain = (rt = []) => rt.map((t) => t.plain_text).join("");

// Notion Block Renderer for Project Detail
function renderBlock(block) {
  if (!block) return null;
  const type = block.type;

  if (type === "heading_1") {
    return <h1 key={block.id} className="pd-block-h1"><RichText value={block.heading_1?.rich_text} /></h1>;
  }
  if (type === "heading_2") {
    return <h2 key={block.id} className="pd-block-h2"><RichText value={block.heading_2?.rich_text} /></h2>;
  }
  if (type === "heading_3") {
    return <h3 key={block.id} className="pd-block-h3"><RichText value={block.heading_3?.rich_text} /></h3>;
  }
  if (type === "paragraph") {
    if (!plain(block.paragraph?.rich_text)) return null;
    return <p key={block.id} className="pd-block-p"><RichText value={block.paragraph?.rich_text} /></p>;
  }
  if (type === "code") {
    return (
      <pre key={block.id} className="pd-block-code">
        <code>{plain(block.code?.rich_text)}</code>
      </pre>
    );
  }
  if (type === "callout") {
    return (
      <div key={block.id} className="pd-block-callout">
        {block.callout?.icon?.emoji && (
          <span className="pd-callout-icon">{block.callout.icon.emoji}</span>
        )}
        <div><RichText value={block.callout?.rich_text} /></div>
      </div>
    );
  }
  if (type === "to_do") {
    return (
      <div key={block.id} className="pd-block-todo">
        <input type="checkbox" checked={!!block.to_do?.checked} readOnly />
        <span className={block.to_do?.checked ? "pd-todo-done" : ""}>
          <RichText value={block.to_do?.rich_text} />
        </span>
      </div>
    );
  }
  if (type === "toggle") {
    return (
      <details key={block.id} className="pd-block-toggle">
        <summary><RichText value={block.toggle?.rich_text} /></summary>
        <div className="pd-toggle-body">
          {(block.children || []).map((c) => renderBlock(c))}
        </div>
      </details>
    );
  }
  if (type === "bookmark" || type === "embed") {
    const url = block[type]?.url;
    if (!url) return null;
    return (
      <a key={block.id} className="pd-block-bookmark" href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
  }
  if (type === "bulleted_list_item" || type === "numbered_list_item") {
    const children = block.children || [];

    return (
      <div key={block.id} className="pd-block-bullet-container">
        <div className="pd-block-bullet">
          <span className="pd-block-bullet-dot">
            {type === "bulleted_list_item" ? "•" : "–"}
          </span>
          <span className="pd-bullet-text">
            <RichText value={block[type]?.rich_text} />
          </span>
        </div>
        {children.length > 0 && (
          <div className="pd-block-bullet-children">
            {children.map((child) => renderBlock(child))}
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
          src={imageUrl(name)}
          alt=""
        />
      </div>
    );
  }
  if (type === "quote") {
    return (
      <blockquote key={block.id} className="pd-block-quote">
        <RichText value={block.quote?.rich_text} />
      </blockquote>
    );
  }
  if (type === "divider") {
    return <hr key={block.id} className="pd-block-divider" />;
  }
  if (type === "column_list") {
    return (
      <div key={block.id} className="pd-block-columns">
        {(block.children || []).map((col) => (
          <div key={col.id} className="pd-block-column">
            {(col.children || []).map((child) => renderBlock(child))}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default ProjectDetail;
