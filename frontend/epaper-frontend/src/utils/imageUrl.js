export function pageImageUrl({
  s3Key,
  pageNumber,
  quality = "high",
  format = "png"
}) {
  const base =
    process.env.BACKEND_API_BASE_URL || "";

  return `${base}/pages/image?s3Key=${encodeURIComponent(
    s3Key
  )}&pageNumber=${pageNumber}&quality=${quality}&format=${format}`;
}