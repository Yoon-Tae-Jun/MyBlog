import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Projects from "./pages/Projects/Projects";
import About from "./pages/About/About";
import NavBar from './componets/NavBar/Navbar';
import "./App.css";

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
              <NavBar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </HashRouter>
          </div>
        </div>
  );
}

export default App;
