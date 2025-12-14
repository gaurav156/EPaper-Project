import { useState } from "react";
import MaskEditor from "./MaskEditor";

function AdminMask() {
  const [page, setPage] = useState(1);

  const s3Key = "newspapers/1765717663336_Midday English 14-12 3 pg.pdf";
  const editionDate = "2025-12-14";

  return (
    <div>
      <h2>Article Mask Editor</h2>

      <div style={{ marginBottom: 10 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      <MaskEditor
        pageImageUrl={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
          s3Key
        )}&pageNumber=${page}`}
        pageNumber={page}
        editionDate={editionDate}
        s3Key={s3Key}
      />
    </div>
  );
}

export default AdminMask;