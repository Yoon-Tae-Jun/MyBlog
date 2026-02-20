import React from 'react';
import { useLocation } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const location = useLocation();

    // Home('/') 경로일 때는 푸터를 렌더링하지 않음
    if (location.pathname === '/') {
        return null;
    }

    return (
        <footer className="footer-container">
            <div className="footer-content">
                <p>© {new Date().getFullYear()} Taejun Yoon. All rights reserved.</p>
                <div className="footer-links">
                    <a href="https://tae-jun.tistory.com/" target="_blank" rel="noreferrer">
                        Blog
                    </a>
                    <a href="https://github.com/Tae-Jun-Yoon" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
