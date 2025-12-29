import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchSessions = async () => {
    const res = await API.get("/admin/sessions");
    setSessions(res.data);
  };

  useEffect(() => {
    fetchSessions();

    // get current session id
    API.get("/auth/me").then(res => {
      setCurrentSessionId(res.data.sessionId);
    });
  }, []);

  const handleForceLogout = async () => {
    try {
      await API.delete(`/admin/sessions/${confirmId}`);
      toast.success("Session force logged out");
      fetchSessions();
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Active Admin Sessions</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>Device</Th>
            <Th>IP</Th>
            <Th>Last Seen</Th>
            <Th>Expires</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>

        <tbody>
          {sessions.map(s => {
            const isCurrent = s._id === currentSessionId;

            return (
              <tr
                key={s._id}
                style={{
                  opacity: s.status !== "ACTIVE" ? 0.5 : 1,
                  background: isCurrent ? "#e6f4ff" : "transparent",
                  fontWeight: isCurrent ? "bold" : "normal"
                }}
              >
                <Td>
                  {isCurrent && "🟢 "}
                  {s.userAgent}
                  {isCurrent && (
                    <span style={{ marginLeft: 6, color: "#1976d2" }}>
                      (This device)
                    </span>
                  )}
                </Td>

                <Td>{s.ip}</Td>
                <Td>{new Date(s.lastSeenAt).toLocaleString()}</Td>
                <Td>{new Date(s.expiresAt).toLocaleString()}</Td>
                <Td>{s.status}</Td>
                <Td>
                  {!isCurrent && s.status === "ACTIVE" && (
                    <button
                      style={dangerBtn}
                      onClick={() => setConfirmId(s._id)}
                    >
                      Force Logout
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfirmModal
        open={!!confirmId}
        title="Force logout?"
        message="This will immediately terminate the user's session."
        onConfirm={handleForceLogout}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

const Th = ({ children }) => (
  <th style={{ padding: 10, borderBottom: "1px solid #ddd", textAlign: "left" }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
    {children}
  </td>
);

const dangerBtn = {
  padding: "4px 8px",
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer"
};

export default AdminSessions;