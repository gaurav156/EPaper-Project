import { Routes, Route, Link } from "react-router-dom";
import Upload from "./Upload";
import AdminEdition from "./AdminEdition";
import AdminMask from "./AdminMask";
import AdminHome from "./AdminHome";
import AdminSessions from "./admin/AdminSessions"; 
import AuditLogs from "./admin/AuditLogs"; 
import { logout } from "../services/api";
import useIdleLogout from "../hooks/useIdleLogout";

function AdminDashboard() {
  useIdleLogout();
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden"
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 56,
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 12,
          paddingBottom: 12,
          gap: 16,
          background: "#fff"
        }}
      >
        <Link title="Dashboard" to="/admin">📊</Link>
        <Link title="Upload Edition" to="/admin/upload">⬆️</Link>
        <Link title="Sessions" to="/admin/sessions">🖥️</Link>
        <Link title="Audit Logs" to="/admin/audit">📜</Link>

        <div style={{ flex: 1 }} />

        <button title="Logout" onClick={logout}>🚪</button>
      </aside>

      {/* Content */}
      <main
        style={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          marginLeft: 12
        }}
      >
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="upload" element={<Upload />} />
          <Route path="edition/:editionId" element={<AdminEdition />} />
          <Route
            path="edition/:editionId/page/:pageNumber"
            element={<AdminMask />}
          />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="audit" element={<AuditLogs />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;