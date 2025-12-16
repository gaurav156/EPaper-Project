import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminEdition() {
  const { editionId } = useParams();
  const navigate = useNavigate();
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    API.get(`/editions/${editionId}`).then(res => {
      setEdition(res.data);
    });
  }, [editionId]);

  if (!edition) return <p>Loading edition...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>
        {edition.newspaperName}
        {edition.city && ` — ${edition.city}`}
      </h2>

      <button
        onClick={() => navigate("/admin")}
        style={{ marginBottom: 12 }}
      >
        ← Back to dashboard
      </button>

      <p>
        Date: <strong>{edition.editionDate}</strong><br />
        Pages: {edition.pageCount}<br />
        Type: {edition.editionType}
      </p>

      <h3>Pages</h3>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {[...Array(edition.pageCount)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 140,
              margin: 10,
              textAlign: "center",
              border: "1px solid #ddd",
              padding: 6
            }}
          >
            <img
              src={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${i + 1}`}
              alt={`Page ${i + 1}`}
              style={{ width: "100%", cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/admin/edition/${edition._id}/page/${i + 1}`
                )
              }
            />

            <div style={{ marginTop: 6 }}>
              Page {i + 1}
            </div>

            <button
              style={{ marginTop: 6 }}
              onClick={() =>
                navigate(
                  `/admin/edition/${edition._id}/page/${i + 1}`
                )
              }
            >
              Edit Masks
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminEdition;