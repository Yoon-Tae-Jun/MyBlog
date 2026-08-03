import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchContent, getCachedContent, imageUrl } from "../../api";
import { ErrorState } from "../../componets/State/State";
import ProjectCover from "../../componets/ProjectCover/ProjectCover";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useRevealGroup } from "../../hooks/useReveal";
import { useSectionScroll } from "../../hooks/useSectionScroll";
import "./Home.css";

const plain = (richText) =>
  (richText || []).map((t) => t.plain_text || "").join("");

/** "2025.12.18(목)-19(금)" 처럼 적힌 날짜에서 앞쪽 날짜만 뽑아 비교용으로 쓴다. */
function parseDate(dateStr = "") {
  const full = dateStr.match(/\d{4}\.\d{2}\.\d{2}/);
  if (full) return new Date(full[0].replace(/\./g, "-"));

  const month = dateStr.match(/\d{4}\.\d{2}/);
  if (month) return new Date(`${month[0].replace(/\./g, "-")}-01`);

  return new Date(0);
}

/** 노션 블록 트리를 납작하게 편다. 소개 글은 column 안에 들어 있다. */
function flattenBlocks(blocks = []) {
  return blocks.flatMap((block) => [block, ...flattenBlocks(block?.children)]);
}

/** 홈 목록에 필요한 값만 뽑는다. 커버는 본문의 첫 이미지 블록을 쓴다. */
function parseProjects(json) {
  if (!json) return [];

  return Object.entries(json["프로젝트"] || {}).map(([id, item]) => {
    const firstImage = (item.blocks || []).find(
      (b) => b?.type === "image" && b.image?.name
    );

    return {
      id,
      title: item.ProjectName || item.description,
      description: item.description,
      tags: item.tag || [],
      status: item.status,
      cover: firstImage?.image?.name || null,
    };
  });
}

/** 소개 블록에서 홈에 요약으로 쓸 문단·관심분야·프로필 사진을 뽑는다. */
function parseIntro(json) {
  const blocks = flattenBlocks(Object.values(json?.["소개"] || {}));

  const paragraphs = blocks
    .filter((b) => b?.type === "paragraph")
    .map((b) => plain(b.paragraph?.rich_text))
    .filter(Boolean);

  const interests = blocks
    .filter((b) => b?.type === "bulleted_list_item")
    .map((b) => plain(b.bulleted_list_item?.rich_text))
    .filter(Boolean);

  const photo = blocks.find((b) => b?.type === "image" && b.image?.name);

  return {
    paragraphs: paragraphs.slice(0, 2),
    interests,
    photo: photo?.image?.name || null,
  };
}

/** 논문·수상은 최신순 앞쪽 몇 건만 홈에 얹는다. */
function parseHighlights(json) {
  const papers = Object.values(json?.["논문"] || {})
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const awards = Object.values(json?.["수상경력"] || {})
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  return { papers, awards };
}

/** 마우스를 따라다니는 미리보기가 켜질 환경인지 (터치 기기·모션 최소화 제외) */
function canUseHoverPreview() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * 커서를 따라오는 커버 미리보기.
 * 프로젝트별 커버를 모두 겹쳐 두고 보이는 것만 바꾼다.
 * 매번 새로 마운트하면 이미지가 늦게 떠서 깜빡이기 때문이다.
 */
function HoverPreview({ projects, activeIndex }) {
  const boxRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const started = useRef(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let frame = 0;

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      // 처음 움직임에서는 보간 없이 바로 그 자리에 둔다 (화면 구석에서 날아오지 않도록)
      if (!started.current) {
        current.current = { ...target.current };
        started.current = true;
      }
    };

    const tick = () => {
      // 커서를 조금 늦게 따라오게 해서 미끄러지는 느낌을 준다
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      box.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className={`hs-preview ${activeIndex !== null ? "is-active" : ""}`}
      aria-hidden="true"
    >
      <div className="hs-preview-inner">
        {projects.map((project, i) => (
          <div
            key={project.id}
            className={`hs-preview-item ${i === activeIndex ? "is-shown" : ""}`}
          >
            <ProjectCover project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  usePageMeta({
    title: "윤태준",
    description:
      "Edge AI와 컴퓨터 비전을 연구하는 윤태준의 포트폴리오입니다. 논문, 프로젝트, 수상 경력을 확인해 보세요.",
    path: "/",
  });

  const [content, setContent] = useState(() => getCachedContent());
  const [status, setStatus] = useState(() =>
    getCachedContent() ? "ready" : "loading"
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoverPreview] = useState(canUseHoverPreview);

  const projects = useMemo(() => parseProjects(content), [content]);
  const intro = useMemo(() => parseIntro(content), [content]);
  const { papers, awards } = useMemo(() => parseHighlights(content), [content]);

  const pageRef = useRevealGroup([status, projects.length]);

  useEffect(() => {
    if (status === "ready" && content) return;

    let cancelled = false;

    fetchContent()
      .then((data) => {
        if (cancelled) return;
        setContent(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("홈 데이터 로드 실패:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // 조금이라도 내려가면 히어로의 스크롤 안내를 접는다
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 휠 한 번에 구역 하나씩, 직접 그린 이징으로 넘어간다 (홈에서만)
  useSectionScroll(".home-section");

  return (
    <div className="home-container" ref={pageRef}>
      <section
        id="top"
        className={`home-section home-hero ${scrolled ? "is-scrolled" : ""}`}
      >
        <h1 className="home-title">
          <span className="typing-text">
            Grounded in facts. Built to actually work.
          </span>
        </h1>
        <p className="home-interest">Edge AI · CV · MLOps</p>

        <div className="home-scroll-cue" aria-hidden="true">
          <span className="home-scroll-label">Scroll</span>
          <span className="home-scroll-line" />
        </div>
      </section>

      {/* ===== 소개 ===== */}
      <section
        id="about"
        className="home-section home-about"
        aria-labelledby="about-title"
      >
        <div className="home-section-inner">
          <header className="hs-head" data-reveal>
            <div>
              <p className="hs-eyebrow">About</p>
              <h2 className="hs-title" id="about-title">
                소개
              </h2>
            </div>
            <Link className="hs-all" to="/about/intro">
              자세히 보기 <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="ab-grid">
            <div className="ab-visual" data-reveal>
              {intro.photo ? (
                <img
                  className="ab-photo"
                  src={imageUrl(intro.photo)}
                  alt="윤태준 프로필 사진"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="ab-photo ab-photo-empty" aria-hidden="true" />
              )}
            </div>

            <div className="ab-text" data-reveal style={{ "--i": 1 }}>
              {status === "loading" && (
                <>
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line short" />
                </>
              )}

              {intro.paragraphs.map((text, i) => (
                <p className="ab-p" key={i}>
                  {text}
                </p>
              ))}

              {intro.interests.length > 0 && (
                <ul className="ab-interests">
                  {intro.interests.map((item) => (
                    <li className="ab-interest" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <dl className="ab-stats">
                <div className="ab-stat">
                  <dt>프로젝트</dt>
                  <dd>{projects.length}</dd>
                </div>
                <div className="ab-stat">
                  <dt>논문</dt>
                  <dd>{papers.length}</dd>
                </div>
                <div className="ab-stat">
                  <dt>수상</dt>
                  <dd>{awards.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 논문 / 수상 ===== */}
      <section
        id="highlights"
        className="home-section home-highlights"
        aria-labelledby="highlights-title"
      >
        <div className="home-section-inner">
          <header className="hs-head" data-reveal>
            <div>
              <p className="hs-eyebrow">Research &amp; Awards</p>
              <h2 className="hs-title" id="highlights-title">
                논문 · 수상
              </h2>
            </div>
          </header>

          <div className="ab-highlights">
            <div className="ab-col" data-reveal>
              <div className="ab-col-head">
                <h3 className="ab-col-title">최근 논문</h3>
                <Link className="ab-col-all" to="/about/paper">
                  전체 <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className="ab-list">
                {papers.slice(0, 3).map((paper) => (
                  <li className="ab-item" key={paper.paperName}>
                    <p className="ab-item-title">{paper.paperName}</p>
                    <p className="ab-item-meta">
                      {paper.conferenceName}
                      {paper.date ? ` · ${paper.date}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ab-col" data-reveal style={{ "--i": 1 }}>
              <div className="ab-col-head">
                <h3 className="ab-col-title">최근 수상</h3>
                <Link className="ab-col-all" to="/about/award">
                  전체 <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className="ab-list">
                {awards.slice(0, 3).map((award) => (
                  <li className="ab-item" key={award.contestName}>
                    <p className="ab-item-title">{award.contestName}</p>
                    <p className="ab-item-meta">
                      {award.awardType}
                      {award.date ? ` · ${award.date}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 프로젝트 ===== */}
      <section
        id="work"
        className="home-section home-showcase"
        aria-labelledby="work-title"
      >
        <div className="home-section-inner">
          <header className="hs-head" data-reveal>
            <div>
              <p className="hs-eyebrow">Selected Work</p>
              <h2 className="hs-title" id="work-title">
                프로젝트
              </h2>
            </div>
            <Link className="hs-all" to="/projects">
              전체 보기 <span aria-hidden="true">→</span>
            </Link>
          </header>

          {status === "error" && (
            <ErrorState
              onRetry={() => {
                setStatus("loading");
                setReloadKey((k) => k + 1);
              }}
            />
          )}

          <div className="hs-list">
            {status === "loading" &&
              Array.from({ length: 4 }).map((_, i) => (
                <div className="hs-row hs-row-skeleton" key={i} aria-hidden="true">
                  <span className="skeleton-line hs-skeleton-index" />
                  <span className="skeleton-line hs-skeleton-name" />
                </div>
              ))}

            {status === "ready" &&
              projects.map((project, i) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="hs-row"
                  data-reveal
                  style={{ "--i": i }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                >
                  <span className="hs-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="hs-body">
                    <span className="hs-name-mask">
                      <span className="hs-name">{project.title}</span>
                    </span>
                    <span className="hs-desc">{project.description}</span>
                  </span>

                  <span className="hs-tags">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span className="hs-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </span>

                  <span className="hs-arrow" aria-hidden="true">
                    →
                  </span>

                  {/* 손가락으로 보는 화면에서는 커서 미리보기가 없으니 썸네일을 직접 붙인다 */}
                  <span className="hs-thumb">
                    <ProjectCover project={project} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ===== 마무리 ===== */}
      <section
        id="contact"
        className="home-section home-contact"
        aria-labelledby="contact-title"
      >
        <div className="home-section-inner" data-reveal>
          <p className="hs-eyebrow">Contact</p>
          <h2 className="home-contact-title" id="contact-title">
            <a className="home-contact-mail" href="mailto:yytaejun@gmail.com">
              yytaejun@gmail.com
            </a>
          </h2>

          <div className="home-contact-links">
            <a
              className="home-contact-link"
              href="https://github.com/Yoon-Tae-Jun"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a
              className="home-contact-link"
              href="https://tae-jun.tistory.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Blog <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {hoverPreview && status === "ready" && projects.length > 0 && (
        <HoverPreview projects={projects} activeIndex={activeIndex} />
      )}
    </div>
  );
}

export default Home;
