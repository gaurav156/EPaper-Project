const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function convertPageToImage(
  pdfPath,
  pageNumber,
  outputDir,
  { quality = "high" } = {}
) {
  return new Promise((resolve, reject) => {
    const dpi = quality === "low" ? 72 : 200;

    const outputPrefix = path.join(
      outputDir,
      `page-${pageNumber}-${quality}`
    );

    // pdftoppm output format:
    // <prefix>-<pageNumber>.png
    // const outputImage = `${outputPrefix}-${pageNumber}.png`;

    // // Cache hit (quality-aware)
    const files = fs
      .readdirSync(outputDir)
      .filter(
        (f) =>
          f.startsWith(`page-${pageNumber}-${quality}`) &&
          f.endsWith(".png")
      );

    if (files.length) {
      return resolve(path.join(outputDir, files[0]));
    }

    const cmd = `pdftoppm -png -r ${dpi} -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${outputPrefix}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);

      // Find the actual generated file
      const files = fs
        .readdirSync(outputDir)
        .filter(
          (f) =>
            f.startsWith(`page-${pageNumber}-${quality}`) &&
            f.endsWith(".png")
        );

      if (!files.length) {
        return reject(
          new Error("pdftoppm did not generate an image")
        );
      }

      resolve(path.join(outputDir, files[0]));
    });
  });
}

module.exports = convertPageToImage;