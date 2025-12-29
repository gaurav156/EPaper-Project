import { useEffect, useState } from "react";
import API from "../../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get("/admin/audit").then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>

      <table width="100%">
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Resource</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.resource}</td>
              <td>{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogs;