import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Projects from "./pages/Projects/Projects";
import About from "./pages/About/About";
import NavBar from './componets/NavBar/Navbar';


function App() {
  return (
    <div style={{backgroundImage: `url("${import.meta.env.BASE_URL}main-background.jpg"`}}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;