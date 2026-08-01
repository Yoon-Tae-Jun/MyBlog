import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import About from "./pages/About/About";
import NotFound from "./pages/NotFound/NotFound";
import NavBar from './componets/NavBar/Navbar';
import Footer from './componets/Footer/Footer';
import { ScrollHandler } from './hooks/useScrollNavigation';
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();
  // 경로를 key로 쓰면 탭을 옮길 때마다 페이지가 통째로 다시 마운트되어
  // 로딩 스켈레톤이 한 번 번쩍인다. 전환 연출은 View Transitions가 맡는다.
  return (
    <div className="page-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<Navigate to="/about/intro" replace />} />
        <Route path="/about/:tabId" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div className="app-root">
      {/* 배경 */}
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="shooting-stars"></div>
      <div className="app-content">
        <BrowserRouter>
          <ScrollHandler />
          <NavBar />
          <AnimatedRoutes />
          <Footer />
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
