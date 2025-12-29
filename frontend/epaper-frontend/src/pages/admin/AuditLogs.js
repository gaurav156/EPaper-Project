import { useEffect, useState } from "react";
import API from "../../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get("/admin/audit").then(res => {
      setLogs(res.data);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Audit Logs</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <Th>Time</Th>
              <Th>Action</Th>
              <Th>Resource</Th>
              <Th>Details</Th>
              <Th>IP</Th>
              <Th>Location</Th>
            </tr>
          </thead>

          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <Td>{new Date(log.createdAt).toLocaleString()}</Td>
                <Td><Badge>{log.action}</Badge></Td>
                <Td>{log.resource}</Td>
                <Td>
                  <pre style={metaStyle}>
                    {log.metadata
                      ? JSON.stringify(log.metadata, null, 2)
                      : "-"}
                  </pre>
                </Td>
                <Td>{log.ip}</Td>
                <Td>{log.geo || "-"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Th = ({ children }) => (
  <th style={{
    padding: 10,
    borderBottom: "1px solid #ddd",
    textAlign: "left"
  }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{
    padding: 10,
    borderBottom: "1px solid #eee",
    verticalAlign: "top"
  }}>
    {children}
  </td>
);

const Badge = ({ children }) => (
  <span style={{
    background: "#1976d2",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12
  }}>
    {children}
  </span>
);

const metaStyle = {
  maxWidth: 300,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0
};

export default AuditLogs;