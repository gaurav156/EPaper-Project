const fs = require("fs");
const path = require("path");
const { MAX_CACHE_MB, CLEANUP_TARGET_MB } = require("../config/cache");

function cleanupImageCache(baseDir) {
  if (!fs.existsSync(baseDir)) return;

  const files = [];

  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        files.push({
          path: full,
          sizeMB: stat.size / 1024 / 1024,
          mtime: stat.mtime
        });
      }
    }
  }

  walk(baseDir);

  let totalMB = files.reduce((s, f) => s + f.sizeMB, 0);

  if (totalMB < MAX_CACHE_MB) return;

  // Oldest first
  files.sort((a, b) => a.mtime - b.mtime);

  for (const file of files) {
    if (totalMB <= CLEANUP_TARGET_MB) break;
    fs.unlinkSync(file.path);
    totalMB -= file.sizeMB;
  }
}

module.exports = cleanupImageCache;