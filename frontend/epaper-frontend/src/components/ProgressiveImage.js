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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [highSrc]);

  return (
    <div style={{ position: "relative", ...style }}>
      {!loaded && (
        <Skeleton
          width="100%"
          height="100%"
          shimmer
          style={{ position: "absolute", inset: 0 }}
        />
      )}

      <img
        src={lowSrc}
        alt={alt}
        style={{
          width: "100%",
          filter: loaded ? "none" : "blur(10px)",
          transition: "filter 0.3s ease",
          ...imgStyle
        }}
      />

      <img
        src={highSrc}
        alt={alt}
        style={{
          width: "100%",
          position: "absolute",
          inset: 0,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          ...imgStyle
        }}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}

export default ProgressiveImage;