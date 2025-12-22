import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function MaskEditor({ pageImageUrl, pageNumber, editionId, s3Key }) {
  const imageRef = useRef(null);
  const scrollRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [start, setStart] = useState(null);
  const [rect, setRect] = useState(null);
  const [savedMasks, setSavedMasks] = useState([]);

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  /* ===================== DRAW HANDLERS ===================== */

  const handleMouseDown = (e) => {
    if (!drawingEnabled || !imageLoaded) return;

    const bounds = imageRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    });
  };

  const handleMouseMove = (e) => {
    if (!drawingEnabled || !start) return;

    const bounds = imageRef.current.getBoundingClientRect();
    const cx = clamp(e.clientX - bounds.left, 0, bounds.width);
    const cy = clamp(e.clientY - bounds.top, 0, bounds.height);

    setRect({
      x: Math.min(start.x, cx),
      y: Math.min(start.y, cy),
      width: Math.abs(cx - start.x),
      height: Math.abs(cy - start.y)
    });
  };

  const handleMouseUp = async () => {
    if (!drawingEnabled || !rect) return;

    const bounds = imageRef.current.getBoundingClientRect();

    const payload = {
      editionId,
      pageNumber,
      s3Key,
      x: rect.x / bounds.width,
      y: rect.y / bounds.height,
      width: rect.width / bounds.width,
      height: rect.height / bounds.height
    };

    const res = await API.post("/masks", payload);
    setSavedMasks(prev => [...prev, res.data]);

    setStart(null);
    setRect(null);
  };

  /* ===================== LOAD MASKS ===================== */

  useEffect(() => {
    API.get(`/masks?editionId=${editionId}&pageNumber=${pageNumber}`)
      .then(res => setSavedMasks(res.data));
  }, [editionId, pageNumber]);

  /* ===================== RENDER ===================== */

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Sticky toolbar */}
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #ddd",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 5
        }}
      >
        <button onClick={() => setDrawingEnabled(d => !d)}>
          {drawingEnabled ? "Stop Mask Creation" : "Start Mask Creation"}
        </button>
      </div>

      {/* Scrollable image area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          background: "#f5f5f5"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            ref={imageRef}
            src={pageImageUrl}
            alt="page"
            draggable={false}
            onLoad={() => setImageLoaded(true)}
            style={{ display: "block", userSelect: "none" }}
          />

          {/* Saved masks */}
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
                  onClick={async (e) => {
                    e.stopPropagation();
                    await API.delete(`/masks/${mask._id}`);
                    setSavedMasks(prev => prev.filter(m => m._id !== mask._id));
                  }}
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "red",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>
            ))}

          {/* Active drawing rect */}
          {rect && drawingEnabled && (
            <div
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                border: "2px solid red",
                background: "rgba(255,0,0,0.2)"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MaskEditor;