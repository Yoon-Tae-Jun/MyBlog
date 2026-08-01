// 백엔드(FastAPI) 주소. 배포 시에는 같은 도메인의 /api 를 그대로 쓴다.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// 노션에서 내려받은 정적 자산도 백엔드 쪽에서 서빙한다.
export const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? "";

export const imageUrl = (name) => `${ASSET_BASE}/page_img/${encodeURIComponent(name)}`;

export const paperUrl = (name) => `${ASSET_BASE}/papers/${encodeURIComponent(name)}`;

export async function fetchContent() {
  const res = await fetch(`${API_BASE}/content`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
