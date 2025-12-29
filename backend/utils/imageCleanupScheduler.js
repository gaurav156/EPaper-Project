const path = require("path");
const cleanupImageCache = require("./cleanupImageCache");

const CACHE_DIR = path.join(__dirname, "../temp");
const MAX_SIZE_MB = 2048; // 2GB
const TTL_HOURS = 24;

setInterval(() => {
  try {
    cleanupImageCache(CACHE_DIR, {
      maxSizeMB: MAX_SIZE_MB,
      maxAgeHours: TTL_HOURS
    });
  } catch (err) {
    console.error("Image cleanup failed:", err);
  }
}, 15 * 60 * 1000); // every 15 minutes