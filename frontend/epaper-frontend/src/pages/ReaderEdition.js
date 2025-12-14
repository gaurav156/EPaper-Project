import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderEdition() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    API.get("/editions").then((res) => {
      const found = res.data.find((e) => e.editionDate === date);
      setEdition(found);
    });
  }, [date]);

  if (!edition) return <p>Loading...</p>;

  return (
    <div>
      <h2>{edition.newspaperName}</h2>
      <p>Date: {edition.editionDate}</p>

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
              navigate(`/read/${date}/page/${i + 1}`)
            }
          >
            <img
              src={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${i + 1}`}
              alt={`Page ${i + 1}`}
              style={{ width: "100%" }}
            />
            <div>Page {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReaderEdition;