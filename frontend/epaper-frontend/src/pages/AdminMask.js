import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import MaskEditor from "./MaskEditor";

function AdminMask() {
  const { editionId, pageNumber } = useParams();
  const [edition, setEdition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/editions/${editionId}`).then((res) => setEdition(res.data));
  }, [editionId]);

  if (!edition) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 100,
          paddingBottom: 8,
          marginBottom: 12,
          borderBottom: "1px solid #ddd"
        }}
      >
        <h2 style={{ margin: "0 0 8px 0" }}>
          Mask Editor — Page {pageNumber}
        </h2>

        <button
          onClick={() => navigate(`/admin/edition/${editionId}`)}
          style={{
            cursor: "pointer"
          }}
        >
          ← Back to pages
        </button>
      </div>

      <MaskEditor
        pageImageUrl={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
          edition.s3Key
        )}&pageNumber=${pageNumber}`}
        pageNumber={Number(pageNumber)}
        editionId={editionId} 
        s3Key={edition.s3Key}
      />
    </div>
  );
}

export default AdminMask;