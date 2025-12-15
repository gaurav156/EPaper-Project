import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderPage() {
  const { date, editionId, pageNumber } = useParams();
  const [edition, setEdition] = useState(null);
  const [masks, setMasks] = useState([]);
  const [pageImageUrl, setPageImageUrl] = useState(null);
  const [articleUrl, setArticleUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!editionId) return;

    API.get(`/editions/${editionId}`).then(res => {
      setEdition(res.data);
    });
  }, [editionId]);

  useEffect(() => {
    if (!edition) return;

    API.get(`/masks?editionDate=${date}&pageNumber=${pageNumber}`)
      .then((res) => setMasks(res.data));

    API.get(
      `/pages/image?s3Key=${edition.s3Key}&pageNumber=${pageNumber}`,
      { responseType: "blob" }
    ).then((res) => {
      setPageImageUrl(URL.createObjectURL(res.data));
    });
  }, [edition, pageNumber, date]);

  useEffect(() => {
    document.body.style.overflow = articleUrl ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [articleUrl]);

  if (!edition) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>
        {edition.newspaperName} — Page {pageNumber}
      </h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        {pageImageUrl && (
          <img src={pageImageUrl} alt="page" style={{ display: "block" }} />
        )}

        {masks.map((mask) => (
          <div
            key={mask._id}
            className="article-mask"
            title="Click to read article"
            style={{
                left: `${mask.x * 100}%`,
                top: `${mask.y * 100}%`,
                width: `${mask.width * 100}%`,
                height: `${mask.height * 100}%`
            }}
            onClick={async () => {
              const res = await API.post(
                "/articles/extract",
                {
                  s3Key: edition.s3Key,
                  pageNumber: Number(pageNumber),
                  mask,
                  newspaperName: edition.newspaperName,
                  editionDate: edition.editionDate
                },
                { responseType: "blob" }
              );

              setArticleUrl(URL.createObjectURL(res.data));
            }}
          />
        ))}
      </div>

      {/* Article Modal */}
      {articleUrl && (
        <div
            style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
            }}
            onClick={() => setArticleUrl(null)}
        >
            <div
            style={{
                background: "#fff",
                padding: 12,
                maxHeight: "90vh",
                overflow: "auto",
                position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
            >
            <button
                onClick={() => setArticleUrl(null)}
                style={{
                position: "absolute",
                top: 8,
                right: 8
                }}
            >
                ✕
            </button>

            <img src={articleUrl} alt="article" />

            <div style={{ textAlign: "right", marginTop: 8 }}>
                <a href={articleUrl} download>
                Download
                </a>
            </div>
            </div>
        </div>
        )}

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12
        }}
      >
        <button
          disabled={Number(pageNumber) <= 1}
          onClick={() =>
            navigate(
              `/read/${date}/edition/${editionId}/page/${Number(pageNumber) - 1}`
            )
          }
        >
          ← Prev
        </button>

        <span>
          Page {pageNumber} of {edition.pageCount}
        </span>

        <button
          disabled={Number(pageNumber) >= edition.pageCount}
          onClick={() =>
            navigate(
              `/read/${date}/edition/${editionId}/page/${Number(pageNumber) + 1}`
            )
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default ReaderPage;