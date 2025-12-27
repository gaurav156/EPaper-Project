import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import ProgressiveImage from "../components/ProgressiveImage";
import LazyThumbnail from "../components/LazyThumbnail";
import { pageImageUrl } from "../utils/imageUrl";

function ReaderPage() {
  const { date, editionId, pageNumber } = useParams();
  const navigate = useNavigate();

  const [edition, setEdition] = useState(null);
  const [masks, setMasks] = useState([]);

  const [pageReady, setPageReady] = useState(false);

  const [articleUrl, setArticleUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  const pinchStartDistance = useRef(null);
  const pinchStartZoom = useRef(1);

  const [extracting, setExtracting] = useState(false);
  const extractLockRef = useRef(false);

  const maskCache = useRef(new Map());

  useEffect(() => {
    API.get(`/editions/${editionId}`).then((res) => {
      setEdition(res.data);
    });
  }, [editionId]);

  useEffect(() => {
    const key = `${editionId}-${pageNumber}`;

    if (maskCache.current.has(key)) {
      setMasks(maskCache.current.get(key));
      return;
    }

    API.get(`/masks?editionId=${editionId}&pageNumber=${pageNumber}`)
      .then(res => {
        maskCache.current.set(key, res.data);
        setMasks(res.data);
      });
  }, [editionId, pageNumber]);

  useEffect(() => {
    maskCache.current.clear();
  }, [editionId]);

  useEffect(() => {
    setZoom(1);
  }, [pageNumber]);

  useEffect(() => {
    document.body.style.overflow = articleUrl ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [articleUrl]);

  useEffect(() => {
    setPageReady(false);
  }, [pageNumber]);

  useEffect(() => {
    if (!edition) return;

    const next = Number(pageNumber) + 1;
    if (next <= edition.pageCount) {      
      new Image().src = pageImageUrl({
        s3Key: edition.s3Key,
        pageNumber: next,
        quality: "low"
      });
  
    }
  }, [edition, pageNumber]);

  useEffect(() => {
    return () => {
      if (articleUrl) {
        URL.revokeObjectURL(articleUrl);
      }
    };
  }, [articleUrl]);

  const handleWheel = (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();

    setZoom((z) => {
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      return Math.min(3, Math.max(0.5, z + delta));
    });
  };

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

  if (!edition) {
    return (
      <div style={{ padding: 20 }}>
        <Skeleton height={24} width={220} />
        <Skeleton height={600} style={{ marginTop: 20 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        userSelect: "none"
      }}
      onWheel={handleWheel}
    >
      {/* LEFT: THUMBNAIL STRIP */}
      <aside
        style={{
          width: 140,
          overflowY: "auto",
          borderRight: "1px solid #ddd",
          padding: 8,
          background: "#fafafa"
        }}
      >
        {!edition
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                height={160}
                radius={4}
                style={{ marginBottom: 10 }}
              />
            ))
          :
          [...Array(edition.pageCount)].map((_, i) => {
            const p = i + 1;
            const active = Number(pageNumber) === p;

            return (
              <div
                key={p}
                onClick={() =>
                  navigate(`/read/${date}/edition/${editionId}/page/${p}`)
                }
                style={{
                  marginBottom: 10,
                  cursor: "pointer",
                  border: active
                    ? "2px solid #1976d2"
                    : "1px solid #ccc",
                  padding: 2
                }}
              > 
                <LazyThumbnail
                  lowSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                    edition.s3Key
                  )}&pageNumber=${p}&quality=low`}
                  highSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                    edition.s3Key
                  )}&pageNumber=${p}&quality=high`}
                  alt={`Page ${p}`}
                />
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    marginTop: 4
                  }}
                >
                  Page {p}
                </div>
              </div>
            );
          })
        }
      </aside>

      {/* RIGHT: MAIN PAGE VIEW */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ padding: 10 }}>
          <button onClick={() => navigate(-1)}>← Back</button>
          <span style={{ marginLeft: 16 }}>
            {edition.newspaperName} — Page {pageNumber}
          </span>
        </div>

        {/* Zoom Controls */}
        <div style={{ padding: "0 10px 10px" }}>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            −
          </button>
          <span style={{ margin: "0 10px" }}>
            {(zoom * 100).toFixed(0)}%
          </span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
            +
          </button>
          <button onClick={() => setZoom(1)} style={{ marginLeft: 10 }}>
            Reset
          </button>
        </div>

        {/* Image Scroll Area */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            borderTop: "1px solid #ddd"
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              position: "relative",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.25s ease-out"
            }}
          >
            {!pageReady && (
              <Skeleton
                width="-webkit-fill-available"
                height={1100}
                shimmer
                radius={6}
                style={{ margin: 20}}
              />
            )}

            <ProgressiveImage
              lowSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${pageNumber}&quality=low`}
              highSrc={`http://localhost:5000/api/pages/image?s3Key=${encodeURIComponent(
                edition.s3Key
              )}&pageNumber=${pageNumber}&quality=high`}
              alt="page"
              imgStyle={{
                pointerEvents: "none",
                userSelect: "none"
              }}
              onLoad={() => setPageReady(true)}
            />

            {/* Mask Overlay */}
            {pageReady && masks.map((mask) => (
              <div
                key={mask._id}
                className="article-mask"
                style={{
                  position: "absolute",
                  left: `${mask.x * 100}%`,
                  top: `${mask.y * 100}%`,
                  width: `${mask.width * 100}%`,
                  height: `${mask.height * 100}%`
                }}
                onClick={async () => {
                  if (extractLockRef.current) return;

                  extractLockRef.current = true;
                  setExtracting(true);

                  try {
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
                  } finally {
                    setExtracting(false);
                    setTimeout(() => {
                      extractLockRef.current = false;
                    }, 500); // debounce window
                  }
                }}
              />
            ))}
          </div>

          {extracting && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                pointerEvents: "none"
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  background: "#fff",
                  borderRadius: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  fontSize: 14
                }}
              >
                Extracting article…
              </div>
            </div>
          )}
        </div>

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
      </main>

      {/* ARTICLE MODAL */}
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

            {extracting && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20
                }}
              >
                Extracting article…
              </div>
            )}

            <img src={articleUrl} alt="article" />

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