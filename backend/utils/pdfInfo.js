const { exec } = require("child_process");

const getPdfPageCount = (pdfPath) => {
  return new Promise((resolve, reject) => {
    exec(`pdfinfo "${pdfPath}"`, (err, stdout) => {
      if (err) return reject(err);

      const match = stdout.match(/Pages:\s+(\d+)/);
      if (!match) return reject("Could not determine page count");

      resolve(Number(match[1]));
    });
  });
};

module.exports = getPdfPageCount;