import { useEffect, useState } from "react";
import API from "../../services/api";

function Sessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    API.get("/admin/sessions").then(res => setSessions(res.data));
  }, []);

  const revoke = async (id) => {
    await API.delete(`/admin/sessions/${id}`);
    setSessions(s => s.filter(x => x._id !== id));
  };

  return (
    <div>
      <h2>Active Admin Sessions</h2>

      <table>
        <thead>
          <tr>
            <th>IP</th>
            <th>Browser</th>
            <th>Last Seen</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s._id}>
              <td>{s.ip}</td>
              <td>{s.userAgent}</td>
              <td>{new Date(s.lastSeenAt).toLocaleString()}</td>
              <td>
                <button onClick={() => revoke(s._id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sessions;