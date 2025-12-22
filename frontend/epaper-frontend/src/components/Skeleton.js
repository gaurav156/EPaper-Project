function Skeleton({ width = "100%", height = 16, radius = 6, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease infinite",
        ...style
      }}
    />
  );
}

export default Skeleton;