export function pageImageUrl({
  s3Key,
  editionId,
  pageNumber,
  quality = "high",
  format = "png"
}) {
  const base = process.env.REACT_APP_BACKEND_API_BASE_URL || "http://localhost:5000/api";

  const params = new URLSearchParams({
    s3Key,
    pageNumber,
    quality,
    format
  });

  // Only include when present
  if (editionId) {
    params.append("editionId", editionId);
  }

  return `${base}/pages/image?${params.toString()}`;
}