const crypto = require("crypto");

function getArticleCacheKey({ s3Key, pageNumber, mask }) {
  const payload = JSON.stringify({
    s3Key,
    pageNumber,
    x: Number(mask.x.toFixed(6)),
    y: Number(mask.y.toFixed(6)),
    w: Number(mask.width.toFixed(6)),
    h: Number(mask.height.toFixed(6))
  });

  return crypto.createHash("md5").update(payload).digest("hex");
}

module.exports = getArticleCacheKey;