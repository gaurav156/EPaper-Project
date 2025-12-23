function Skeleton({ width = "100%", height = 16, radius = 4, style, shimmer }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: shimmer
          ? "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)"
          : "#eee",
        backgroundSize: shimmer ? "400% 100%" : undefined,
        animation: shimmer ? "shimmer 1.4s ease infinite" : undefined,
        ...style
      }}
    />
  );
}

export default Skeleton;