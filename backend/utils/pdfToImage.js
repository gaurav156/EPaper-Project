const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { ENABLE_WEBP } = require("../config/features");

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
    const outputImage = `${outputPrefix}.png`;

    if (fs.existsSync(outputImage)) {
      return resolve(outputImage);
    }

    const cmd = `pdftoppm -png -r ${dpi} -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${outputPrefix}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);

      // pdftoppm creates page-1-high-1.png
      const generated = `${outputPrefix}-${pageNumber}.png`;

      if (!fs.existsSync(generated)) {
        const files = fs
          .readdirSync(outputDir)
          .filter(
            (f) =>
              f.startsWith(outputPrefix) &&
              f.endsWith(".png")
          );

        if (files.length) {
          return resolve(path.join(outputDir, files[0]));
        }

        return reject(
          new Error(`pdftoppm did not generate expected file: ${generated}`)
        );
      }

      fs.renameSync(generated, outputImage);
      resolve(outputImage);
    });
  });
}

async function maybeConvertToWebp(pngPath) {
  if (!ENABLE_WEBP) return pngPath;

  const webpPath = pngPath.replace(".png", ".webp");

  if (fs.existsSync(webpPath)) {
    return webpPath;
  }

  await sharp(pngPath)
    .webp({ quality: 80 })
    .toFile(webpPath);

  return webpPath;
}

module.exports = { convertPageToImage, maybeConvertToWebp };