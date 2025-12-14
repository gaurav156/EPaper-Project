import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function MaskEditor({ pageImageUrl, pageNumber, editionDate, s3Key }) {
  const containerRef = useRef(null);
  const [start, setStart] = useState(null);
  const [rect, setRect] = useState(null);
  const [savedMasks, setSavedMasks] = useState([]);

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!start) return;
    const rect = containerRef.current.getBoundingClientRect();

    setRect({
      x: start.x,
      y: start.y,
      width: e.clientX - rect.left - start.x,
      height: e.clientY - rect.top - start.y
    });
  };

  const handleMouseUp = async () => {
    if (!rect || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();

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

      // ✅ IMPORTANT: update local state immediately
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
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img src={pageImageUrl} alt="page" />

      {savedMasks.map((mask) => (
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
        />
      ))}

      {rect && (
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