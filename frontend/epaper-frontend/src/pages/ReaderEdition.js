import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderEdition() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);

  useEffect(() => {
  API.get("/editions").then((res) => {
    const filtered = res.data.filter(
      (e) => e.editionDate === date
    );
    setEditions(filtered);
  });
  }, [date]);

  if (!editions.length) {
    return <p>No editions available for this date.</p>;
  }

  return (
    <div>
      <h2>Editions for {date}</h2>

      {editions.map((edition) => (
        <div
          key={edition._id}
          style={{
            padding: 12,
            borderBottom: "1px solid #ddd"
          }}
        >
          <h3>
            {edition.newspaperName}
            {edition.city && ` — ${edition.city}`}
            {edition.editionType === "SPECIAL" && ` (${edition.category})`}
          </h3>

          <p>Pages: {edition.pageCount}</p>

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {[...Array(edition.pageCount)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 120,
                  margin: 10,
                  textAlign: "center",
                  cursor: "pointer"
                }}
                onClick={() =>
                  navigate(
                    `/read/${date}/edition/${edition._id}/page/${i + 1}`
                  )
                }
              >
                <img
                  src={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                    edition.s3Key
                  )}&pageNumber=${i + 1}`}
                  alt={`Page ${i + 1}`}
                  style={{ width: "100%", background: "#f0f0f0" }}
                  loading="lazy"
                />
                <div>Page {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReaderEdition;