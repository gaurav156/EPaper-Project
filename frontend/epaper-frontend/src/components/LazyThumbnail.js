import { useEffect, useRef, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";

function LazyThumbnail({ lowSrc, highSrc, alt }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // preload slightly before visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 180 }}>
      {visible && (
        <ProgressiveImage
          lowSrc={lowSrc}
          highSrc={highSrc}
          alt={alt}
          imgStyle={{ width: "100%" }}
        />
      )}
    </div>
  );
}

export default LazyThumbnail;