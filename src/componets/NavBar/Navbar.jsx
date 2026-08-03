import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { animateScrollTo } from "../../hooks/useSectionScroll";
import "./Navbar.css";

/**
 * section이 있는 항목은 홈에서 그 자리로 스크롤하고,
 * 다른 페이지에서는 to 주소로 이동한다.
 * (홈은 쭉 이어지는 한 페이지라 라우트를 갈아끼울 이유가 없다)
 */
const menuItems = [
  { label: "Home", to: "/", section: "top" },
  { label: "About", to: "/about", section: "about" },
  { label: "Projects", to: "/projects", section: "work" },
  { label: "Blog", to: "https://tae-jun.tistory.com/", external: true },
  { label: "GitHub", to: "https://github.com/Yoon-Tae-Jun", external: true },
];

/** 홈 구역 순서. 논문·수상 구역은 메뉴에서 About으로 함께 표시한다. */
const SECTION_IDS = ["top", "about", "highlights", "work", "contact"];
const SECTION_TO_MENU = {
  top: "top",
  about: "about",
  highlights: "about",
  work: "work",
  contact: "contact",
};

const NavBar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  const isHome = location.pathname === "/";

  // 페이지를 옮기면 모바일 메뉴는 닫는다
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // 메뉴가 열린 동안 뒤 배경이 스크롤되지 않도록
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 조금이라도 내려가면 바에 배경을 깔아 글자가 본문에 묻히지 않게 한다
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 홈에서는 지금 보고 있는 구역을 메뉴에 표시한다
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === "undefined") {
      setActiveSection("top");
      return;
    }

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean
    );
    if (!sections.length) return;

    // 화면 가운데 띠(-45%/-45%)를 지나는 구역을 현재 구역으로 본다
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(SECTION_TO_MENU[visible.target.id] || visible.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const scrollToSection = (id) => {
    if (id === "top") {
      animateScrollTo(0);
      return true;
    }

    const el = document.getElementById(id);
    if (!el) return false;

    // 휠로 구역을 넘길 때와 같은 이징으로 움직여 감각을 맞춘다
    const offset = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
    ) || 0;

    animateScrollTo(el.getBoundingClientRect().top + window.scrollY - offset);
    return true;
  };

  const isActive = (item) => {
    if (isHome) return item.section === activeSection;
    return (
      (item.to === "/" && location.pathname === "/") ||
      (item.to !== "/" && location.pathname.startsWith(item.to))
    );
  };

  const handleClick = (e, item) => {
    // 다른 페이지에서는 평소대로 주소로 이동한다
    if (!isHome || !item.section) {
      setOpen(false);
      return;
    }

    // 새 탭으로 열기 같은 조작은 가로채지 않는다
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // 구역을 찾지 못하면 Link가 원래 주소로 넘어가게 둔다
    if (item.section !== "top" && !document.getElementById(item.section)) {
      setOpen(false);
      return;
    }

    e.preventDefault();
    setOpen(false);
    // 드로어를 닫으며 body의 스크롤 잠금이 풀린 다음에 움직여야 한다
    requestAnimationFrame(() => scrollToSection(item.section));
  };

  const renderItem = (item) =>
    item.external ? (
      <a href={item.to} target="_blank" rel="noopener noreferrer" className="nav-a">
        {item.label}
      </a>
    ) : (
      <Link
        to={item.to}
        viewTransition
        className={`nav-a ${isActive(item) ? "active" : ""}`}
        aria-current={isActive(item) ? "page" : undefined}
        onClick={(e) => handleClick(e, item)}
      >
        {item.label}
      </Link>
    );

  return (
    <header className={`nav-bar ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="nav-container">
        <Link
          to="/"
          viewTransition
          className="nav-logo-text"
          onClick={(e) => handleClick(e, { to: "/", section: "top" })}
        >
          TJ Blog
        </Link>

        <div className="nav-right">
          {/* 데스크톱 메뉴 */}
          <ul className="nav-ul">
            {menuItems.map((item) => (
              <li key={item.label}>{renderItem(item)}</li>
            ))}
          </ul>

          {/* 테마 버튼과 햄버거는 항상 한 덩어리로 붙여 둔다 */}
          <div className="nav-actions">
            <ThemeToggle />
            <button
              type="button"
              className={`nav-toggle ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* 모바일 드로어 */}
        <div className={`nav-drawer ${open ? "is-open" : ""}`}>
          <ul className="nav-drawer-ul">
            {menuItems.map((item) => (
              <li key={item.label}>{renderItem(item)}</li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
