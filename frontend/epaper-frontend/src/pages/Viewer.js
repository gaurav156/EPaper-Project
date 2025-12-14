import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

function Viewer() {
  const [params] = useSearchParams();
  const key = params.get("key");

  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [masks, setMasks] = useState([]);
  const [pageImageUrl, setPageImageUrl] = useState(null);

  // Fetch masks for current page
  useEffect(() => {
    API.get(`/masks?editionDate=2025-12-14&pageNumber=${page}`)
      .then((res) => setMasks(res.data));
  }, [page]);

  // Fetch page image from backend
  useEffect(() => {
    const fetchPageImage = async () => {
      try {
        const res = await API.get(
          `/pages/image?s3Key=${key}&pageNumber=${page}`,
          { responseType: "blob" }
        );

        setPageImageUrl(URL.createObjectURL(res.data));
      } catch (err) {
        console.error("Failed to load page image", err);
      }
    };

    fetchPageImage();
  }, [key, page]);

  return (
    <div>
      <h2>Newspaper Viewer</h2>

      {/* Zoom Controls */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
          -
        </button>
        <span style={{ margin: "0 10px" }}>
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
          +
        </button>
      </div>

      {/* Page Image + Masks */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          transform: `scale(${zoom})`,
          transformOrigin: "top left"
        }}
      >
        {pageImageUrl && (
          <img
            src={pageImageUrl}
            alt="page"
            style={{ display: "block", userSelect: "none" }}
          />
        )}

        {masks.map((mask) => (
          <div
            key={mask._id}
            style={{
              position: "absolute",
              left: `${mask.x * 100}%`,
              top: `${mask.y * 100}%`,
              width: `${mask.width * 100}%`,
              height: `${mask.height * 100}%`,
              background: "rgba(0,0,255,0.25)",
              cursor: "pointer"
            }}
            onClick={async () => {
              const res = await API.post(
                "/articles/extract",
                {
                  s3Key: key,
                  pageNumber: page,
                  mask,
                  newspaperName: "MyNews English",
                  editionDate: "2025-12-14"
                },
                { responseType: "blob" }
              );

              const url = URL.createObjectURL(res.data);
              window.open(url);
            }}
          />
        ))}
      </div>

      {/* Page Navigation */}
      <div style={{ marginTop: 10 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default Viewer;