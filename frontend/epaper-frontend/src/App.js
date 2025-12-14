import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Viewer from "./pages/Viewer";
import AdminMask from "./pages/AdminMask";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/mask" element={<AdminMask />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;