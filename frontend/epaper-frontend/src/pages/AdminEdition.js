import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import ProgressiveImage from "../components/ProgressiveImage";

function AdminEdition() {
  const { editionId } = useParams();
  const navigate = useNavigate();

  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/editions/${editionId}`)
      .then(res => setEdition(res.data))
      .finally(() => setLoading(false));
  }, [editionId]);

  if (loading) return <p>Loading edition…</p>;
  if (!edition) return <p>Edition not found</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <span
          style={{ cursor: "pointer", color: "#007bff" }}
          onClick={() => navigate("/admin")}
        >
          Dashboard
        </span>
        {" / "}
        <strong>{edition.newspaperName}</strong>
      </div>

      <h2>
        {edition.newspaperName}
        {edition.city && ` — ${edition.city}`}
      </h2>

      <p>
        Date: <strong>{edition.editionDate}</strong>
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
              cursor: "pointer"
            }}
            onClick={() =>
              navigate(`/admin/edition/${editionId}/page/${i + 1}`)
            }
          >
            <ProgressiveImage
              lowSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${i + 1}&quality=low`}
              highSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${i + 1}&quality=high`}
              alt={`Page ${i + 1}`}
              style={{ width: "100%", minHeight: 180 }}
              imgStyle={{ objectFit: "cover" }}
            />
            <div>Page {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminEdition;