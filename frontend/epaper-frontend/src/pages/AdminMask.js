import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import MaskEditor from "./MaskEditor";

function AdminMask() {
  const { editionId, pageNumber } = useParams();
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    API.get(`/editions/${editionId}`).then((res) => setEdition(res.data));
  }, [editionId]);

  if (!edition) return <p>Loading...</p>;

  return (
    <div>
      <h2>
        {edition.newspaperName} - Page {pageNumber}
      </h2>

      <MaskEditor
        pageImageUrl={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
          edition.s3Key
        )}&pageNumber=${pageNumber}`}
        pageNumber={Number(pageNumber)}
        editionDate={edition.editionDate}
        s3Key={edition.s3Key}
      />
    </div>
  );
}

export default AdminMask;