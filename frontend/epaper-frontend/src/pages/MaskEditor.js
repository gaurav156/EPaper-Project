import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

function MaskEditor({ pageImageUrl, pageNumber, editionId }) {
  const imageRef = useRef(null);

  const resizeRef = useRef({
    active: false,
    maskId: null,
    corner: null,
    startX: 0,
    startY: 0,
    startRect: null
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const [start, setStart] = useState(null);
  const [draftRect, setDraftRect] = useState(null);
  const [savedMasks, setSavedMasks] = useState([]);

  const [saving, setSaving] = useState(false);

  /* ================= FETCH MASKS ================= */
  useEffect(() => {
    API.get(`/masks?editionId=${editionId}&pageNumber=${pageNumber}`)
      .then(res => setSavedMasks(res.data));
  }, [editionId, pageNumber]);

  /* ================= DRAW NEW MASK ================= */
  const handleMouseDown = (e) => {
    if (!drawingEnabled || !imageLoaded || resizeRef.current.active) return;

    const bounds = imageRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    });
  };

  const handleMouseMove = (e) => {
    if (!start || !imageRef.current || resizeRef.current.active) return;

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
    if (!draftRect || !imageRef.current || resizeRef.current.active) return;

    const bounds = imageRef.current.getBoundingClientRect();

    const normalized = {
      x: Number((draftRect.x / bounds.width).toFixed(6)),
      y: Number((draftRect.y / bounds.height).toFixed(6)),
      width: Number((draftRect.width / bounds.width).toFixed(6)),
      height: Number((draftRect.height / bounds.height).toFixed(6))
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
  const startResize = (e, mask, corner) => {
    e.stopPropagation();

    const bounds = imageRef.current.getBoundingClientRect();

    resizeRef.current = {
      active: true,
      maskId: mask._id,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startRect: {
        x: mask.x * bounds.width,
        y: mask.y * bounds.height,
        width: mask.width * bounds.width,
        height: mask.height * bounds.height
      }
    };
  };

  const handleResizeMove = (e) => {
    if (!resizeRef.current.active) return;

    const { corner, startX, startY, startRect, maskId } = resizeRef.current;
    const bounds = imageRef.current.getBoundingClientRect();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let { x, y, width, height } = startRect;

    if (corner.includes("r")) width += dx;
    if (corner.includes("l")) {
      width -= dx;
      x += dx;
    }
    if (corner.includes("b")) height += dy;
    if (corner.includes("t")) {
      height -= dy;
      y += dy;
    }

    width = Math.max(10, width);
    height = Math.max(10, height);

    setSavedMasks(prev =>
      prev.map(m =>
        m._id === maskId
          ? {
              ...m,
              x: x / bounds.width,
              y: y / bounds.height,
              width: width / bounds.width,
              height: height / bounds.height
            }
          : m
      )
    );
  };

  const endResize = async () => {
    if (!resizeRef.current.active) return;

    resizeRef.current.active = false;

    const mask = savedMasks.find(m => m._id === resizeRef.current.maskId);
    if (!mask) return;

    setSaving(true);

    await API.put(`/masks/${mask._id}`, {
      x: mask.x,
      y: mask.y,
      width: mask.width,
      height: mask.height
    });

    setSaving(false);
  };

  /* ================= DELETE ================= */
  const deleteMask = async (e, id) => {
    e.stopPropagation();
    await API.delete(`/masks/${id}`);
    setSavedMasks(prev => prev.filter(m => m._id !== id));
  };

  const ResizeHandle = ({ corner, mask }) => (
    <div
      onMouseDown={(e) => startResize(e, mask, corner)}
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        background: "#fff",
        border: "2px solid #007bff",
        cursor:
          corner === "tl" || corner === "br"
            ? "nwse-resize"
            : "nesw-resize",
        ...(corner === "tl" && { top: -5, left: -5 }),
        ...(corner === "tr" && { top: -5, right: -5 }),
        ...(corner === "bl" && { bottom: -5, left: -5 }),
        ...(corner === "br" && { bottom: -5, right: -5 })
      }}
    />
  );

  /* ================= RENDER ================= */
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
        <button
          disabled={!imageLoaded}
          onClick={() => setDrawingEnabled(v => !v)}
        >
          {drawingEnabled ? "🛑 Stop Drawing" : "✏️ Draw Mask"}
        </button>
      </div>

      {/* Canvas */}
      <div
        style={{ flex: 1, overflow: "auto", cursor: drawingEnabled ? "crosshair" : "default" }}
        onMouseMove={handleResizeMove}
        onMouseUp={endResize}
        onMouseLeave={endResize}
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

          {!imageLoaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              Loading page…
            </div>
          )}

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
                <ResizeHandle corner="tl" mask={mask} />
                <ResizeHandle corner="tr" mask={mask} />
                <ResizeHandle corner="bl" mask={mask} />
                <ResizeHandle corner="br" mask={mask} />

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
              </div>
            ))}

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

          {saving && (
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              Saving…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MaskEditor;