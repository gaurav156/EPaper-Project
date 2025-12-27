import { useEffect, useRef, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";
import { observe, unobserve } from "../utils/visibilityObserver";

function LazyThumbnail({ lowSrc, highSrc, alt, style, imgStyle }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    observe(node, () => setVisible(true));

    return () => {
      unobserve(node);
    };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 180, ...style }}>
      {visible && (
        <ProgressiveImage
          lowSrc={lowSrc}
          highSrc={highSrc}
          alt={alt}
          imgStyle={{ width: "100%", ...imgStyle }}
          fadeDuration={200}
        />
      )}
    </div>
  );
}

export default LazyThumbnail;