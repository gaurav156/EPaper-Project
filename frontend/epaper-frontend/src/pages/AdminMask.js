import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import MaskEditor from "./MaskEditor";

function AdminMask() {
  const { editionId, pageNumber } = useParams();
  const navigate = useNavigate();
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    API.get(`/editions/${editionId}`).then(res => setEdition(res.data));
  }, [editionId]);

  if (!edition) return <p>Loading…</p>;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Header / Breadcrumb */}
      <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <div style={{ fontSize: 14 }}>
          <span onClick={() => navigate("/admin")} style={{ cursor: "pointer", color: "#007bff" }}>
            Dashboard
          </span>
          {" / "}
          <span
            onClick={() => navigate(`/admin/edition/${editionId}`)}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            {edition.newspaperName}
          </span>
          {" / "}
          <strong>Page {pageNumber}</strong>
        </div>
        <h2 style={{ margin: "8px 0" }}>Mask Editor</h2>
      </div>

      {/* Mask Editor fills rest of screen */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MaskEditor
          editionId={editionId}
          pageNumber={Number(pageNumber)}
          s3Key={edition.s3Key}
          pageImageBaseUrl={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
            edition.s3Key
          )}&pageNumber=${pageNumber}`}
        />
      </div>
    </div>
  );
}

export default AdminMask;