const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function cropArticle({
  pageImagePath,
  mask,
  footerText,
  outputDir,
  cacheKey
}) {
  const outputPath = path.join(outputDir, `article-${cacheKey}.png`);

  // Cache hit
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }

  const image = sharp(pageImagePath);
  const metadata = await image.metadata();

  // Convert normalized → pixels
  const cropArea = {
    left: Math.round(mask.x * metadata.width),
    top: Math.round(mask.y * metadata.height),
    width: Math.round(mask.width * metadata.width),
    height: Math.round(mask.height * metadata.height)
  };

  const footerWidth = await measureFooterWidth(footerText);
  const finalWidth = Math.max(cropArea.width, footerWidth);

  const leftPadding = Math.floor((finalWidth - cropArea.width) / 2);
  const rightPadding = finalWidth - cropArea.width - leftPadding;

  // Crop + extend for footer
  await image
    .extract(cropArea)
    .extend({
      top: 0,
    bottom: 50,
    left: leftPadding,
    right: rightPadding,
      background: "#ffffff"
    })
    .composite([
      {
      input: Buffer.from(
        `<svg width="${finalWidth}" height="50">
            <text
              x="50%"
              y="30"
              text-anchor="middle"
              font-size="18"
              fill="#000"
            font-family="Arial, Helvetica, sans-serif">
              ${footerText}
            </text>
        </svg>`
      ),
        top: cropArea.height,
        left: 0
      }
    ])
    .toFile(outputPath);

  return outputPath;
}

async function measureFooterWidth(footerText) {
  const padding = 40; // left + right padding

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="50">
      <text
        x="0"
        y="30"
        font-size="18"
        font-family="Arial, Helvetica, sans-serif">
        ${footerText}
      </text>
    </svg>
  `;

  const buffer = Buffer.from(svg);

  const metadata = await sharp(buffer).metadata();
  return metadata.width + padding;
}

module.exports = cropArticle;