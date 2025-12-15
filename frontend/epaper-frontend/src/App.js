import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Viewer from "./pages/Viewer";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEdition from "./pages/AdminEdition";
import AdminMask from "./pages/AdminMask";
import ReaderHome from "./pages/ReaderHome";
import ReaderEdition from "./pages/ReaderEdition";
import ReaderPage from "./pages/ReaderPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edition/:id" element={<AdminEdition />} />
        <Route
          path="/admin/mask/:editionId/page/:pageNumber"
          element={<AdminMask />}
        />
        <Route path="/read" element={<ReaderHome />} />
        <Route path="/read/:date" element={<ReaderEdition />} />
        <Route path="/read/:date/page/:pageNumber" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;