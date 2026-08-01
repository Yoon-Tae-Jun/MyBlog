import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Navbar.css";

const menuItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "https://tae-jun.tistory.com/", external: true },
  { label: "GitHub", to: "https://github.com/Yoon-Tae-Jun", external: true },
];

const NavBar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

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

  const isActive = (to) =>
    (to === "/" && location.pathname === "/") ||
    (to !== "/" && location.pathname.startsWith(to));

  const renderItem = (item) =>
    item.external ? (
      <a href={item.to} target="_blank" rel="noopener noreferrer" className="nav-a">
        {item.label}
      </a>
    ) : (
      <Link
        to={item.to}
        viewTransition
        className={`nav-a ${isActive(item.to) ? "active" : ""}`}
      >
        {item.label}
      </Link>
    );

  return (
    <nav className="nav-container">
      <Link to="/" viewTransition className="nav-logo-text">
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
  );
};

export default NavBar;
