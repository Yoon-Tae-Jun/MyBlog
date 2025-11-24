// src/pages/Projects/Projects.jsx
import React, { useState, useEffect } from "react";
import "./Projects.css";

const FILTERS = ["All", "Edge AI", "Computer Vision", "Networking", "ML / NLP", "Web", "Other"];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("All");

  useEffect(() => {
    // public/db.json 은 /db.json 으로 접근 가능
    fetch(`${import.meta.env.BASE_URL}db.json`)
      .then((res) => res.json())
      .then((data) => {
        const rawProjects = data["프로젝트"] || {};

        const parsed = Object.entries(rawProjects).map(([id, item], idx) => {
          const tags = item.tag || [];
          const mainTag = tags[0] || "Other"; // 첫 번째 태그를 category처럼 사용

          return {
            id,
            title: item.title || item.description, // title 없으니까 description을 제목처럼 사용
            description: item.description,
            tags,
            category: mainTag,
            status: "In Progress", // 필요하면 JSON에 status 추가해도 됨
          };
        });

        setProjects(parsed);
      })
      .catch((err) => {
        console.error("db.json 로드 실패:", err);
      });
  }, []);

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

        {/* 프로젝트 카드 리스트 */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-card">
              <div className="project-card-header">
                <h2 className="project-card-title">{project.title}</h2>
                <span className="project-status status-in-progress">
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
            <div className="empty-state">
              <p>No projects in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Projects;
