const fs = require("fs");
const path = require("path");

function getImageCacheStats(baseDir) {
  let totalSize = 0;
  let totalFiles = 0;
  let pngFiles = 0;
  let webpFiles = 0;
  let oldest = null;
  let newest = null;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        totalFiles++;
        totalSize += stat.size;

        if (file.endsWith(".png")) pngFiles++;
        if (file.endsWith(".webp")) webpFiles++;

        if (!oldest || stat.mtime < oldest) oldest = stat.mtime;
        if (!newest || stat.mtime > newest) newest = stat.mtime;
      }
    }
  }

  walk(baseDir);

  return {
    totalFiles,
    totalSizeMB: Number((totalSize / 1024 / 1024).toFixed(2)),
    pngFiles,
    webpFiles,
    oldestFile: oldest,
    newestFile: newest
  };
}

module.exports = getImageCacheStats;