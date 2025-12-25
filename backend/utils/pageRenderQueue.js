const convertPageToImage = require("./pdfToImage");

const queue = [];
let running = false;

async function processQueue() {
  if (running || queue.length === 0) return;

  running = true;
  const job = queue.shift();

  try {
    await convertPageToImage(
      job.pdfPath,
      job.pageNumber,
      job.outputDir,
      { quality: job.quality }
    );
  } catch (e) {
    console.error("Pre-render failed:", e.message);
  } finally {
    running = false;
    processQueue();
  }
}

function enqueuePageRender(job) {
  queue.push(job);
  processQueue();
}

module.exports = { enqueuePageRender };