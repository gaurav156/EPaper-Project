import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import MaskEditor from "./MaskEditor";

function AdminMask() {
  const { editionId, pageNumber } = useParams();
  const navigate = useNavigate();

  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/editions/${editionId}`)
      .then(res => setEdition(res.data))
      .finally(() => setLoading(false));
  }, [editionId]);

  if (loading) return <p>Loading…</p>;
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
        <span
          style={{ cursor: "pointer", color: "#007bff" }}
          onClick={() => navigate(`/admin/edition/${editionId}`)}
        >
          {edition.newspaperName}
        </span>
        {" / "}
        <strong>Page {pageNumber}</strong>
      </div>

      <h2>Mask Editor — Page {pageNumber}</h2>

      <p style={{ color: "#666", fontSize: 13 }}>
        Scroll to view full page • Drag to draw article masks
      </p>

      <div 
        style={{ 
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 12 
        }}
      >
        <MaskEditor
          editionId={editionId}
          pageNumber={Number(pageNumber)}
          s3Key={edition.s3Key}
          pageImageUrl={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
            edition.s3Key
          )}&pageNumber=${pageNumber}`}
        />
      </div>
    </div>
  );
}

export default AdminMask;