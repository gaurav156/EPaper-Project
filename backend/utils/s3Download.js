const fs = require("fs");
const path = require("path");
const s3 = require("./s3");

const downloadPdfFromS3 = async (s3Key) => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const localPath = path.join(tempDir, path.basename(s3Key));

  // If already downloaded, reuse
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key
  };

  const fileStream = fs.createWriteStream(localPath);

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(fileStream)
      .on("finish", () => resolve(localPath))
      .on("error", reject);
  });
};

module.exports = downloadPdfFromS3;