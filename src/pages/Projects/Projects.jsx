// src/pages/Projects/Projects.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContent, getCachedContent, invalidateContent } from "../../api";
import { CardSkeleton, ErrorState, EmptyState } from "../../componets/State/State";
import { usePageMeta } from "../../hooks/usePageMeta";
import "./Projects.css";

const FILTERS = ["All", "Edge AI", "MLOps", "Web", "Other"];

/** API 응답에서 프로젝트 카드에 필요한 값만 뽑아낸다. */
function parseProjects(json) {
  if (!json) return [];

  return Object.entries(json["프로젝트"] || {}).map(([id, item]) => {
    const tags = item.tag || [];
    return {
      id,
      title: item.ProjectName || item.description,
      description: item.description,
      tags,
      category: tags[0] || "Other", // 첫 번째 태그를 category처럼 사용
      status: item.status,
    };
  });
}

function Projects() {
  const [projects, setProjects] = useState(() => parseProjects(getCachedContent()));
  // 이미 받아 둔 데이터가 있으면 로딩 화면을 건너뛴다
  const [status, setStatus] = useState(() =>
    getCachedContent() ? "ready" : "loading"
  );
  const [currentFilter, setCurrentFilter] = useState("All");
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  usePageMeta({
    title: "Projects",
    description:
      "Edge AI, 컴퓨터 비전, MLOps 분야에서 진행한 프로젝트 모음입니다.",
    path: "/projects",
  });

  useEffect(() => {
    if (status === "ready" && projects.length) return;

    let cancelled = false;

    fetchContent()
      .then((data) => {
        if (cancelled) return;
        setProjects(parseProjects(data));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("프로젝트 로드 실패:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const filteredProjects =
    currentFilter === "All"
      ? projects
      : projects.filter((p) => p.category === currentFilter);

  return (
    <div className="projects-page">
      <div className="projects-inner">
        {/* 헤더 */}
        <header className="projects-header">
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">
            A collection of projects I&apos;ve been working on.
          </p>
        </header>

        {/* 필터 탭 */}
        <div className="projects-filter-bar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-chip ${
                currentFilter === filter ? "filter-chip-active" : ""
              }`}
              onClick={() => setCurrentFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {status === "loading" && <CardSkeleton count={6} />}

        {status === "error" && (
          <ErrorState onRetry={() => { invalidateContent(); setStatus("loading"); setReloadKey((k) => k + 1); }} />
        )}

        {/* 프로젝트 카드 리스트 */}
        {status === "ready" && (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <article 
              key={project.id} 
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="project-card-header">
                <h2 className="project-card-title">{project.title}</h2>
                <span
                  className={`project-status ${
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
              </div>

              <p className="project-card-category">{project.category}</p>

              <p className="project-card-description">
                {project.description}
              </p>

              <div className="project-card-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}

          {filteredProjects.length === 0 && (
            <EmptyState message="이 분류에는 아직 프로젝트가 없습니다." />
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
