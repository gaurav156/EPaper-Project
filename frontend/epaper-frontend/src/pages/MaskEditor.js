import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function MaskEditor({ pageImageUrl, pageNumber, editionDate, s3Key }) {
  const imageRef = useRef(null);
  const [start, setStart] = useState(null);
  const [rect, setRect] = useState(null);
  const [savedMasks, setSavedMasks] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const handleMouseDown = (e) => {
    if (!imageLoaded || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!imageLoaded || !start) return;
    const bounds = imageRef.current.getBoundingClientRect();

    const rawX = e.clientX - bounds.left;
    const rawY = e.clientY - bounds.top;

    const currentX = clamp(rawX, 0, bounds.width);
    const currentY = clamp(rawY, 0, bounds.height);

    const x = Math.min(start.x, currentX);
    const y = Math.min(start.y, currentY);
    const width = Math.abs(currentX - start.x);
    const height = Math.abs(currentY - start.y);

    setRect({ x, y, width, height });
  };

  const handleMouseUp = async () => {
    if (!imageLoaded || !rect || !imageRef.current) return;

    const container = imageRef.current.getBoundingClientRect();

    const normalizedRect = {
      x: rect.x / container.width,
      y: rect.y / container.height,
      width: rect.width / container.width,
      height: rect.height / container.height
    };

    try {
      const res = await API.post("/masks", {
        editionDate,
        pageNumber,
        s3Key,
        ...normalizedRect
      });

      // IMPORTANT: update local state immediately
      setSavedMasks((prev) => [...prev, res.data]);

      setStart(null);
      setRect(null);
    } catch (err) {
      console.error("Failed to save mask", err);
    }
  };

  useEffect(() => {
    API.get(`/masks?editionDate=${editionDate}&pageNumber=${pageNumber}`)
      .then((res) => setSavedMasks(res.data));
  }, [editionDate, pageNumber]);

  return (
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
        style={{
          display: "block",
          userSelect: "none"
        }}
      />

      {imageLoaded && savedMasks.map((mask) => (
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
          {/* Delete button */}
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await API.delete(`/masks/${mask._id}`);
                setSavedMasks((prev) =>
                  prev.filter((m) => m._id !== mask._id)
                );
              } catch (err) {
                console.error("Failed to delete mask", err);
              }
            }}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "none",
              background: "red",
              color: "white",
              cursor: "pointer",
              fontSize: 12,
              lineHeight: "20px"
            }}
          >
            ×
          </button>
        </div>
      ))}

      {imageLoaded && rect && (
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
  );
}

export default MaskEditor;