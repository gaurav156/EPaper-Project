import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderHome() {
  const navigate = useNavigate();

  // Today in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    API.get(`/editions?date=${selectedDate}`)
      .then((res) => setEditions(res.data))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>Read Newspaper</h2>

      {/* Calendar */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={selectedDate}
          max={today}             // 🚫 future dates disabled
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && <p>Loading editions…</p>}

      {/* Editions */}
      {!loading && editions.length === 0 && (
        <p>No editions available for this date.</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {editions.map((edition) => (
          <div
            key={edition._id}
            onClick={() =>
              navigate(
                `/read/${edition.editionDate}/edition/${edition._id}/page/1`
              )
            }
            style={{
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              background: "#fff"
            }}
          >
            <h3 style={{ margin: 0 }}>
              {edition.newspaperName}
              {edition.city && ` — ${edition.city}`}
            </h3>

            {edition.editionType === "SPECIAL" && (
              <span style={{ color: "crimson", fontSize: 13 }}>
                {edition.category}
              </span>
            )}

            <p style={{ marginTop: 6 }}>
              {edition.pageCount} pages
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReaderHome;