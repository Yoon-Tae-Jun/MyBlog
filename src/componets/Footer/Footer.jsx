import React from 'react';
import './Footer.css';

// 예전에는 홈이 한 화면짜리라 푸터를 숨겼지만,
// 지금은 홈도 아래로 쭉 이어지는 페이지라 모든 경로에서 보여 준다.
function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <p>© {new Date().getFullYear()} Taejun Yoon. All rights reserved.</p>
                <div className="footer-links">
                    <a href="https://tae-jun.tistory.com/" target="_blank" rel="noreferrer">
                        Blog
                    </a>
                    <a href="https://github.com/Yoon-Tae-Jun" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
