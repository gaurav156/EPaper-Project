import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminHome() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);  
  const [editions, setEditions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!date) return;

    API.get("/editions").then(res => {
      const filtered = res.data.filter(
        e => e.editionDate === date
      );
      setEditions(filtered);
    });
  }, [date]);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <label>
        Select Date:
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>

      <h3>Editions for {date}</h3>

      <hr />

      {date && editions.length === 0 && (
        <p>No editions found for this date.</p>
      )}

      {editions.map(edition => (
        <div
          key={edition._id}
          style={{
            padding: 12,
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <strong>{edition.newspaperName}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>
              Pages: {edition.pageCount}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() =>
                navigate(`/admin/viewer?key=${edition.s3Key}`)
              }
            >
              View
            </button>

            <button
              onClick={() =>
                navigate(`/admin/edition/${edition._id}`)
              }
            >
              Masks
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminHome;