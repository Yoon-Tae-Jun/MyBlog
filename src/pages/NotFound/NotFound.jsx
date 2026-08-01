import { Link } from "react-router-dom";
import { usePageMeta } from "../../hooks/usePageMeta";
import "./NotFound.css";

function NotFound() {
  usePageMeta({ title: "페이지를 찾을 수 없습니다" });

  return (
    <div className="notfound-container">
      <p className="notfound-code">404</p>
      <h1 className="notfound-title">페이지를 찾을 수 없습니다</h1>
      <p className="notfound-desc">
        주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.
      </p>
      <Link to="/" className="notfound-link">
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default NotFound;
