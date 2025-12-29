import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

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

  const handleForceLogout = async (sessionId) => {
    if (!window.confirm("Are you sure you want to force logout this session?")) {
      return;
    }

    try {
      await API.delete(`/admin/sessions/${sessionId}`);
      toast.success("Session force logged out");
      fetchSessions();
    } catch {
      toast.error("Failed to revoke session");
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

                <Td>
                  {!isCurrent && (
                    <button
                      style={dangerBtn}
                      onClick={() => handleForceLogout(s._id)}
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