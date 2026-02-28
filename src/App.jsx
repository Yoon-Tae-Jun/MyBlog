import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home/home";
import Projects from "./pages/Projects/Projects";
import About from "./pages/About/About";
import NavBar from './componets/NavBar/Navbar';
import Footer from './componets/Footer/Footer';
import { ScrollHandler } from './hooks/useScrollNavigation';
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<Navigate to="/about/intro" replace />} />
        <Route path="/about/:tabId" element={<About />} />
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
        <HashRouter>
          <ScrollHandler />
          <NavBar />
          <AnimatedRoutes />
          <Footer />
        </HashRouter>
      </div>
    </div>
  );
}

export default App;
