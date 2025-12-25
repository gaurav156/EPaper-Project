import { useEffect, useState } from "react";
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

  useEffect(() => {
    setHighLoaded(false);
  }, [highSrc]);

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
        style={{
          width: "100%",
          filter: highLoaded ? "none" : "blur(12px)",
          transition: "filter 0.3s ease",
          ...imgStyle
        }}
      />

      {/* High-res */}
      <img
        src={highSrc}
        alt={alt}
        draggable={false}
        style={{
          width: "100%",
          position: "absolute",
          inset: 0,
          opacity: highLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
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