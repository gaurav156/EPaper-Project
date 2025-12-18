import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderPage() {
  const { date, editionId, pageNumber } = useParams();
  const navigate = useNavigate();

  const [edition, setEdition] = useState(null);
  const [masks, setMasks] = useState([]);
  const [pageImageUrl, setPageImageUrl] = useState(null);
  const [articleUrl, setArticleUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  const pinchStartDistance = useRef(null);
  const pinchStartZoom = useRef(1);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (!editionId) return;

    API.get(`/editions/${editionId}`).then((res) => {
      setEdition(res.data);
    });
  }, [editionId]);

  useEffect(() => {
    if (!edition) return;

    API.get(`/masks?editionId=${editionId}&pageNumber=${pageNumber}`)
      .then((res) => setMasks(res.data));

    API.get(
      `/pages/image?s3Key=${edition.s3Key}&pageNumber=${pageNumber}`,
      { responseType: "blob" }
    ).then((res) => {
      setPageImageUrl(URL.createObjectURL(res.data));
    });
  }, [edition, editionId, pageNumber]);

  useEffect(() => {
    setZoom(1);
  }, [pageNumber]);

  useEffect(() => {
    const onWheel = (e) => {
      if (!e.ctrlKey) return;

      e.preventDefault(); // stop browser zoom

      setZoom((z) => {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        return Math.min(3, Math.max(0.5, z + delta));
      });
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStartDistance.current = getTouchDistance(e.touches);
      pinchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      e.preventDefault();
      const scale =
        getTouchDistance(e.touches) / pinchStartDistance.current;

      setZoom(
        Math.min(3, Math.max(0.5, pinchStartZoom.current * scale))
      );
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
  };

  if (!edition) return <p>Loading…</p>;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* ---------- Header ---------- */}
      <div style={{ padding: 16 }}>
        <h2>
          {edition.newspaperName} — Page {pageNumber}
        </h2>

        <button onClick={() => navigate(-1)}>← Back</button>

        {/* Zoom controls */}
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            −
          </button>

          <span style={{ margin: "0 10px" }}>
            {(zoom * 100).toFixed(0)}%
          </span>

          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
            +
          </button>

          <button style={{ marginLeft: 8 }} onClick={() => setZoom(1)}>
            Reset
          </button>
        </div>
      </div>

      {/* ---------- Scrollable Page Area ---------- */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          overflow: "auto",
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd"
        }}
      >
        <div
          style={{
            width: `${zoom * 100}%`,
            height: "auto"
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.25s ease-out"
            }}
          >
            {pageImageUrl && (
              <img
                src={pageImageUrl}
                alt="page"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  display: "block",
                  width: "100%",
                  userSelect: "none",
                  pointerEvents: "none"
                }}
              />
            )}

            {/* Mask overlay */}
            <div style={{ position: "absolute", inset: 0 }}>
              {masks.map((mask) => (
                <div
                  key={mask._id}
                  className="article-mask"
                  title="Click to read article"
                  style={{
                    position: "absolute",
                    left: `${mask.x * 100}%`,
                    top: `${mask.y * 100}%`,
                    width: `${mask.width * 100}%`,
                    height: `${mask.height * 100}%`
                  }}
                  onClick={async () => {
                    const res = await API.post(
                      "/articles/extract",
                      {
                        s3Key: edition.s3Key,
                        pageNumber: Number(pageNumber),
                        mask,
                        newspaperName: edition.newspaperName,
                        editionDate: edition.editionDate
                      },
                      { responseType: "blob" }
                    );

                    setArticleUrl(URL.createObjectURL(res.data));
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Page Navigation ---------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          padding: 12,
          background: "#fff",
          borderTop: "1px solid #ddd"
        }}
      >
        <button
          disabled={Number(pageNumber) <= 1}
          onClick={() =>
            navigate(`/read/${date}/edition/${editionId}/page/${Number(pageNumber) - 1}`)
          }
        >
          ← Prev
        </button>

        <span>
          Page {pageNumber} of {edition.pageCount}
        </span>

        <button
          disabled={Number(pageNumber) >= edition.pageCount}
          onClick={() =>
            navigate(`/read/${date}/edition/${editionId}/page/${Number(pageNumber) + 1}`)
          }
        >
          Next →
        </button>
      </div>

      {/* ---------- Article Modal ---------- */}
      {articleUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setArticleUrl(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 12,
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setArticleUrl(null)}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              ✕
            </button>

            <img src={articleUrl} alt="article" draggable={false} style={{ userSelect: "none", pointerEvents: "none" }} />

            <div style={{ textAlign: "right", marginTop: 8 }}>
              <a href={articleUrl} download>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReaderPage;