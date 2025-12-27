import { useEffect, useRef, useState } from "react";
import Skeleton from "./Skeleton";

function ProgressiveImage({
  lowSrc,
  highSrc,
  alt,
  onLoad,
  style,
  imgStyle
}) {
  const [highLoaded, setHighLoaded] = useState(false);
  const highImgRef = useRef(null);

  // Reset when src changes
  useEffect(() => {
    setHighLoaded(false);
  }, [highSrc]);

  // handle cached images
  useEffect(() => {
    const img = highImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setHighLoaded(true);
      onLoad?.();
    }
  }, [highSrc, onLoad]);

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      {!highLoaded && (
        <Skeleton
          shimmer
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
      )}

      {/* Low-res */}
      <img
        src={lowSrc}
        alt={alt}
        draggable={false}
        aria-hidden
        style={{
          width: "100%",
          filter: highLoaded ? "none" : "blur(12px)",
          transition: "filter 0.25s ease",
          ...imgStyle
        }}
      />

      {/* High-res */}
      <img
        ref={highImgRef}
        src={highSrc}
        alt={alt}
        draggable={false}
        style={{
          width: "100%",
          position: "absolute",
          inset: 0,
          opacity: highLoaded ? 1 : 0,
          transition: "opacity 0.25s ease",
          ...imgStyle
        }}
        onLoad={() => {
          setHighLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}

export default ProgressiveImage;