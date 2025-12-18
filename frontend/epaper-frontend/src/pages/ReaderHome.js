import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderHome() {
  const navigate = useNavigate();
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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2>Read Newspaper</h2>

      {/* Calendar */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading && <p>Loading editions…</p>}

      {!loading && editions.length === 0 && (
        <p>No editions available for this date.</p>
      )}

      {/* Edition Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20
        }}
      >
        {editions.map((edition) => (
          <div
            key={edition._id}
            onClick={() =>
              navigate(
                `/read/${edition.editionDate}/edition/${edition._id}/page/1`
              )
            }
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
              background: "#fff",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(0,0,0,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "none")
            }
          >
            {/* Thumbnail */}
            <div style={{ height: 160, overflow: "hidden" }}>
              <img
                src={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                  edition.s3Key
                )}&pageNumber=1`}
                alt="Page 1"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>

            {/* Card Content */}
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: "4px 0" }}>
                {edition.newspaperName}
              </h3>

              {edition.city && (
                <div style={{ fontSize: 14, color: "#555" }}>
                  {edition.city}
                </div>
              )}

              {edition.editionType === "SPECIAL" && (
                <div
                  style={{
                    marginTop: 6,
                    display: "inline-block",
                    padding: "2px 8px",
                    fontSize: 12,
                    borderRadius: 12,
                    background: "#ffe8cc",
                    color: "#b45309"
                  }}
                >
                  {edition.category || "Special"}
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 13 }}>
                {edition.pageCount} pages
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReaderHome;