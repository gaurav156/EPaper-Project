import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

function MaskEditor({ pageImageUrl, pageNumber, editionId }) {
  const imageRef = useRef(null);
  const resizeRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const [start, setStart] = useState(null);
  const [draftRect, setDraftRect] = useState(null);
  const [savedMasks, setSavedMasks] = useState([]);

  /* ================= FETCH MASKS ================= */
  useEffect(() => {
    API.get(`/masks?editionId=${editionId}&pageNumber=${pageNumber}`)
      .then(res => setSavedMasks(res.data));
  }, [editionId, pageNumber]);

  /* ================= DRAW NEW MASK ================= */
  const handleMouseDown = (e) => {
    if (!drawingEnabled || !imageLoaded) return;

    const bounds = imageRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    });
  };

  const handleMouseMove = (e) => {
    if (!start || !imageRef.current) return;

    const bounds = imageRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - bounds.left, 0, bounds.width);
    const y = clamp(e.clientY - bounds.top, 0, bounds.height);

    setDraftRect({
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      width: Math.abs(x - start.x),
      height: Math.abs(y - start.y)
    });
  };

  const handleMouseUp = async () => {
    if (!draftRect || !imageRef.current) return;

    const bounds = imageRef.current.getBoundingClientRect();

    const normalized = {
      x: draftRect.x / bounds.width,
      y: draftRect.y / bounds.height,
      width: draftRect.width / bounds.width,
      height: draftRect.height / bounds.height
    };

    const res = await API.post("/masks", {
      editionId,
      pageNumber,
      ...normalized
    });

    setSavedMasks(prev => [...prev, res.data]);
    setStart(null);
    setDraftRect(null);
  };

  /* ================= RESIZE ================= */
  const startResize = (e, mask) => {
    e.stopPropagation();
    resizeRef.current = mask;
  };

  const handleResizeMove = (e) => {
    if (!resizeRef.current || !imageRef.current) return;

    const bounds = imageRef.current.getBoundingClientRect();
    const mx = clamp((e.clientX - bounds.left) / bounds.width, 0, 1);
    const my = clamp((e.clientY - bounds.top) / bounds.height, 0, 1);

    setSavedMasks(prev =>
      prev.map(m =>
        m._id === resizeRef.current._id
          ? { ...m, width: mx - m.x, height: my - m.y }
          : m
      )
    );
  };

  const stopResize = async () => {
    if (!resizeRef.current) return;

    const m = savedMasks.find(x => x._id === resizeRef.current._id);
    await API.patch(`/masks/${m._id}`, m);

    resizeRef.current = null;
  };

  /* ================= DELETE ================= */
  const deleteMask = async (e, id) => {
    e.stopPropagation();
    await API.delete(`/masks/${id}`);
    setSavedMasks(prev => prev.filter(m => m._id !== id));
  };

  /* ================= RENDER ================= */
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
        <button onClick={() => setDrawingEnabled(v => !v)}>
          {drawingEnabled ? "🛑 Stop Drawing" : "✏️ Draw Mask"}
        </button>
      </div>

      {/* Canvas */}
      <div
        style={{ flex: 1, overflow: "auto", cursor: drawingEnabled ? "crosshair" : "default" }}
        onMouseMove={handleResizeMove}
        onMouseUp={stopResize}
      >
        <div
          style={{ position: "relative", display: "inline-block" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={pageImageUrl}
            alt="page"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
            style={{ display: "block", userSelect: "none" }}
          />

          {/* Masks */}
          {imageLoaded &&
            savedMasks.map(mask => (
              <div
                key={mask._id}
                style={{
                  position: "absolute",
                  left: `${mask.x * 100}%`,
                  top: `${mask.y * 100}%`,
                  width: `${mask.width * 100}%`,
                  height: `${mask.height * 100}%`,
                  border: "2px solid green",
                  background: "rgba(0,255,0,0.15)"
                }}
              >
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => deleteMask(e, mask._id)}
                  style={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: "bold",
                    lineHeight: "24px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
                  }}
                  title="Delete mask"
                >
                  ×
                </button>

                <div
                  onMouseDown={(e) => startResize(e, mask)}
                  style={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    width: 12,
                    height: 12,
                    background: "green",
                    cursor: "nwse-resize"
                  }}
                />
              </div>
            ))}

          {/* Draft */}
          {imageLoaded && draftRect && (
            <div
              style={{
                position: "absolute",
                left: draftRect.x,
                top: draftRect.y,
                width: draftRect.width,
                height: draftRect.height,
                border: "2px dashed red"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MaskEditor;