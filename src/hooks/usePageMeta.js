import { useEffect } from "react";

const SITE = "윤태준";
const BASE_URL = "https://taejun.dev";

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [key, val] = selector.replace(/meta\[|\]/g, "").split("=");
    el.setAttribute(key, val.replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * 페이지별 title / description / canonical 을 갱신한다.
 * SPA라 크롤러가 초기 HTML만 보는 경우도 있지만, 브라우저 탭과
 * 링크 공유 시점에는 이 값이 사용된다.
 */
export function usePageMeta({ title, description, path }) {
  useEffect(() => {
    if (title) {
      const full = title === SITE ? title : `${title} | ${SITE}`;
      document.title = full;
      setMeta('meta[property="og:title"]', "content", full);
    }

    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
    }

    if (path) {
      const url = `${BASE_URL}${path}`;
      setMeta('meta[property="og:url"]', "content", url);

      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    }
  }, [title, description, path]);
}
