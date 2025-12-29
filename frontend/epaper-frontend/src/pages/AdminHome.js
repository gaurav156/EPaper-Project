import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminHome() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);  
  const [editions, setEditions] = useState([]);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!date) return;

    API.get("/editions").then(res => {
      const filtered = res.data.filter(
        e => e.editionDate === date
      );
      setEditions(filtered);
    });
  }, [date]);

  useEffect(() => {
    API.get("/admin/metrics/summary")
      .then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {stats && (
        <div style={{ display: "flex", gap: 16 }}>
          <div>📄 Page Views: {stats.pages}</div>
          <div>📰 Articles: {stats.articles}</div>
        </div>
      )}

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 16
        }}
      >
        {editions.map((edition) => (
          <div
            key={edition._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
            }}
          >
            <h3 style={{ margin: "0 0 6px" }}>
              {edition.newspaperName}
            </h3>

            <div style={{ color: "#555", fontSize: 14 }}>
              {edition.city && <div>📍 {edition.city}</div>}
              {edition.editionType === "SPECIAL" && (
                <div>⭐ {edition.category}</div>
              )}
              <div>📄 Pages: {edition.pageCount}</div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12
              }}
            >
              <button
                onClick={() =>
                  navigate(`/read/${edition.editionDate}/edition/${edition._id}/page/1`)
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
    </div>
  );
}

export default AdminHome;