import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css"
const NavBar = () => {
    const location = useLocation();

    const menuItems = [
      { label: "Home", to: "/" },
      { label: "소개", to: "/about" },
      { label: "블로그", to: "/blog" },
      { label: "프로젝트", to: "/projects" },
      { label: "GitHub", to: "https://github.com/Yoon-Tae-Jun", external: true },
    ];
  
    return (
        <nav className="nav-container">
          <div className="navbar-content-wrapper">
          <ul className="nav-ul">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`nav-a`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className={`nav-a ${location.pathname === item.to ? "active" : ""}`}
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