import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import ProgressiveImage from "../components/ProgressiveImage";

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

      {loading && (
        <div style={{ display: "flex", gap: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 260,
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                background: "#fff"
              }}
            >
              <Skeleton height={160} radius={8} />
              <Skeleton height={18} style={{ marginTop: 12 }} />
              <Skeleton height={14} width="60%" style={{ marginTop: 6 }} />
              <Skeleton height={14} width="40%" style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && editions.length === 0 && (
        <p>No editions available for this date.</p>
      )}

      {/* Edition Cards */}
      {!loading && (
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
                <ProgressiveImage
                  lowSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                    edition.s3Key
                  )}&pageNumber=1&quality=low`}
                  highSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                    edition.s3Key
                  )}&pageNumber=1&quality=high`}
                  alt="Page 1"
                  style={{ height: 160 }}
                  imgStyle={{
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
      )}
    </div>
  );
}

export default ReaderHome;