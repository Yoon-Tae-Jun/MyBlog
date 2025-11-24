import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css"
const NavBar = () => {
    const location = useLocation();

    const menuItems = [
      { label: "Home", to: "/" },
      { label: "About", to: "/about" },
      { label: "Project", to: "/projects" },
      { label: "Blog", to: "https://tae-jun.tistory.com/", external: true },
      { label: "GitHub", to: "https://github.com/Yoon-Tae-Jun", external: true },
    ];
  
    return (
        <nav className="nav-container">
          {/* 왼쪽 고정 로고 */}
          <div className="nav-left-logo">
            <Link to="/" className="nav-logo-text">
              TJ Blog
            </Link>
          </div>

          {/* 메뉴 */}
          <div className="navbar-content-wrapper">
            <ul className="nav-ul">
              {menuItems.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-a"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className={`nav-a ${
                        location.pathname === item.to ? "active" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      
    );
  };
  
  
  export default NavBar;