const { exec } = require("child_process");
const path = require("path");

const convertPageToImage = (pdfPath, pageNumber, outputDir) => {
  return new Promise((resolve, reject) => {
    const outputFile = path.join(outputDir, `page-${pageNumber}`);
    const cmd = `pdftoppm -png -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${outputFile}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve(`${outputFile}-1.png`);
    });
  });
};

module.exports = convertPageToImage;