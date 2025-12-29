import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import ReaderHome from "./pages/ReaderHome";
import ReaderEdition from "./pages/ReaderEdition";
import ReaderPage from "./pages/ReaderPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import "./App.css";
import { ToastContainer } from "react-toastify";

function App() {

  useEffect(() => {
    const preventBrowserZoom = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", preventBrowserZoom, {
      passive: false
    });

    return () => {
      document.removeEventListener("wheel", preventBrowserZoom);
    };
  }, []);

  useEffect(() => {
    const preventCopy = (e) => e.preventDefault();

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventCopy);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventCopy);
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Reader Routes */}
          <Route path="/" element={<ReaderHome />} />
          <Route path="/read" element={<ReaderHome />} />
          <Route path="/read/:date" element={<ReaderEdition />} />
          <Route path="/read/:date/edition/:editionId/page/:pageNumber" element={<ReaderPage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Area */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;