import { Routes, Route, Link } from "react-router-dom";

import Upload from "./Upload";
import AdminEdition from "./AdminEdition";
import AdminMask from "./AdminMask";
import AdminHome from "./AdminHome";

function AdminDashboard() {
  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Admin Header / Navigation */}
      <header
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          borderBottom: "1px solid #ddd",
          paddingBottom: 10
        }}
      >
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/upload">Upload</Link>
        <button onClick={logout}>Logout</button>
      </header>

      {/* Admin Internal Routes */}
      <Routes>
        {/* Default admin page */}
        <Route path="/" element={<AdminHome />} />

        <Route path="upload" element={<Upload />} />

        <Route path="edition/:editionId" element={<AdminEdition />} />
        <Route
          path="edition/:editionId/page/:pageNumber"
          element={<AdminMask />}
        />
      </Routes>
    </div>
  );
}

export default AdminDashboard;