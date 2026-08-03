import { imageUrl } from "../../api";
import "./ProjectCover.css";

/** 제목을 색상 계열로 바꾸기 위한 아주 단순한 해시 (djb2). */
function hashString(text = "") {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) {
    h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * 노션에 이미지를 아직 넣지 않은 프로젝트도 목록에서 빈 칸으로 보이지 않도록,
 * 제목을 씨앗 삼아 항상 같은 그래픽을 만들어 준다.
 * 나중에 노션에 이미지 블록이 생기면 자동으로 사진 쪽으로 넘어간다.
 */
function GeneratedCover({ title, label }) {
  const seed = hashString(title);
  const hue = seed % 360;
  const style = {
    "--cover-h1": hue,
    "--cover-h2": (hue + 48) % 360,
    // 원 두 개의 위치를 씨앗으로 흔들어 프로젝트마다 다른 구성이 되게 한다
    "--cover-x": `${20 + (seed % 45)}%`,
    "--cover-y": `${18 + ((seed >> 3) % 50)}%`,
  };

  return (
    <div className="cover-gen" style={style} aria-hidden="true">
      <span className="cover-gen-ring" />
      <span className="cover-gen-ring cover-gen-ring-2" />
      {label && <span className="cover-gen-label">{label}</span>}
    </div>
  );
}

/**
 * 프로젝트 커버. 이미지가 있으면 사진을, 없으면 생성 그래픽을 렌더한다.
 * 크기는 항상 부모가 정한다.
 */
function ProjectCover({ project, className = "", loading = "lazy" }) {
  const cover = project?.cover;

  return (
    <div className={`project-cover ${className}`.trim()}>
      {cover ? (
        <img
          className="project-cover-img"
          src={imageUrl(cover)}
          alt=""
          loading={loading}
          decoding="async"
        />
      ) : (
        <GeneratedCover title={project?.title || ""} label={project?.tags?.[0]} />
      )}
    </div>
  );
}

export default ProjectCover;
