import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc =
  "//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

function Viewer() {
  const [params] = useSearchParams();
  const key = params.get("key");

  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1.2);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const res = await API.get(`/upload/signed-url?key=${key}`);
        setPdfUrl(res.data.url);
      } catch (err) {
        console.error("Failed to get signed URL", err);
      }
    };

    fetchSignedUrl();
  }, [key]);

  if (!pdfUrl) return <p>Loading PDF...</p>;

  return (
    <div>
      <h2>Newspaper Viewer</h2>

      <div>
        <button onClick={() => setZoom((z) => z - 0.1)}>-</button>
        <button onClick={() => setZoom((z) => z + 0.1)}>+</button>
      </div>

      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(err) => console.error("PDF load error:", err)}
      >
        <Page pageNumber={page} scale={zoom} />
      </Document>

      <div>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {numPages}
        </span>
        <button disabled={page >= numPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Viewer;