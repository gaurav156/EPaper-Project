const { exec } = require("child_process");
const path = require("path");

const convertPageToImage = (pdfPath, pageNumber, outputDir) => {
  return new Promise((resolve, reject) => {
    const outputPrefix = path.join(outputDir, `page-${pageNumber}`);
    const cmd = `pdftoppm -png -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${outputPrefix}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);

      // pdftoppm always appends the page number to the output prefix
      const imagePath = `${outputPrefix}-${pageNumber}.png`;
      resolve(imagePath);
    });
  });
};

module.exports = convertPageToImage;