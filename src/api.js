// 백엔드(FastAPI) 주소. 배포 시에는 같은 도메인의 /api 를 그대로 쓴다.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// 노션에서 내려받은 정적 자산도 백엔드 쪽에서 서빙한다.
export const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? "";

export const imageUrl = (name) => `${ASSET_BASE}/page_img/${encodeURIComponent(name)}`;

export const paperUrl = (name) => `${ASSET_BASE}/papers/${encodeURIComponent(name)}`;

// 모든 페이지가 같은 /content 를 쓰므로 한 번 받아 두고 재사용한다.
// 페이지를 옮길 때마다 다시 요청하면 로딩 스켈레톤이 번쩍인다.
let cached = null;
let inFlight = null;

/** 이미 받아 둔 데이터가 있으면 즉시 반환한다 (없으면 null). */
export function getCachedContent() {
  return cached;
}

export function fetchContent() {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = fetch(`${API_BASE}/content`)
    .then((res) => {
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.json();
    })
    .then((json) => {
      cached = json;
      inFlight = null;
      return json;
    })
    .catch((err) => {
      // 실패는 캐시하지 않는다. 다시 시도할 수 있어야 한다.
      inFlight = null;
      throw err;
    });

  return inFlight;
}

/** "다시 시도" 시 캐시를 버리고 새로 받는다. */
export function invalidateContent() {
  cached = null;
  inFlight = null;
}
