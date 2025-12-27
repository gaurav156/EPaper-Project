import { useEffect, useRef, useState } from "react";
import Skeleton from "./Skeleton";

const LOAD_TIMEOUT_MS = 8000; // fail-safe
const MAX_RETRIES = 1;

function ProgressiveImage({
  lowSrc,
  highSrc,
  alt,
  onLoad,
  style,
  imgStyle,
  fadeDuration = 250
}) {
  const [highLoaded, setHighLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const highImgRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);

  /* Reset when source changes */
  useEffect(() => {
    setHighLoaded(false);
    setError(false);
    setRetryCount(0);

    clearTimeout(timeoutRef.current);

    // timeout fail-safe
    timeoutRef.current = setTimeout(() => {
      setHighLoaded(true); // force-hide skeleton
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [highSrc]);

  /* Cached image detection */
  useEffect(() => {
    const img = highImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      clearTimeout(timeoutRef.current);
      setHighLoaded(true);
      onLoad?.();
    }
  }, [highSrc, onLoad]);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    return () => {
      abortRef.current?.abort();
    };
  }, [highSrc]);

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      {!highLoaded && !error && (
        <Skeleton
          shimmer
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
      )}

      {/* Low-res */}
      {!error && (
        <img
          src={lowSrc}
          alt={alt}
          draggable={false}
          aria-hidden
          style={{
            width: "100%",
            filter: highLoaded ? "none" : "blur(12px)",
            transition: `filter ${fadeDuration}ms ease`,
            ...imgStyle
          }}
          signal={abortRef.current?.signal} // supported in modern browsers
        />
      )}

      {/* High-res */}
      {!error && (
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
            transition: `opacity ${fadeDuration}ms ease`,
            ...imgStyle
          }}
          signal={abortRef.current?.signal} // supported in modern browsers
          onLoad={() => {
            clearTimeout(timeoutRef.current);
            setHighLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            clearTimeout(timeoutRef.current);

            if (retryCount < MAX_RETRIES) {
              setRetryCount(c => c + 1);

              // Force reload by cache-busting
              const url = new URL(highSrc, window.location.href);
              url.searchParams.set("_retry", Date.now());

              if (highImgRef.current) {
                highImgRef.current.src = url.toString();
              }
            } else {
              setError(true);
            }
          }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div
          style={{
            inset: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f2f2f2",
            color: "#777",
            fontSize: 13
          }}
        >
          Image unavailable
        </div>
      )}
    </div>
  );
}

export default ProgressiveImage;