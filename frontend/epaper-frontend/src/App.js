import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReaderHome from "./pages/ReaderHome";
import ReaderEdition from "./pages/ReaderEdition";
import ReaderPage from "./pages/ReaderPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
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
  );
}

export default App;