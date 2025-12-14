import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function ReaderPage() {
  const { date, pageNumber } = useParams();
  const [edition, setEdition] = useState(null);
  const [masks, setMasks] = useState([]);
  const [pageImageUrl, setPageImageUrl] = useState(null);
  const [articleUrl, setArticleUrl] = useState(null);

  useEffect(() => {
    API.get("/editions").then((res) => {
      const found = res.data.find((e) => e.editionDate === date);
      setEdition(found);
    });
  }, [date]);

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

  if (!edition) return <p>Loading...</p>;

  return (
    <div>
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
            style={{
              position: "absolute",
              left: `${mask.x * 100}%`,
              top: `${mask.y * 100}%`,
              width: `${mask.width * 100}%`,
              height: `${mask.height * 100}%`,
              background: "rgba(0,0,255,0.25)",
              cursor: "pointer"
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
            justifyContent: "center"
          }}
          onClick={() => setArticleUrl(null)}
        >
          <div style={{ background: "#fff", padding: 10 }}>
            <img src={articleUrl} alt="article" />
            <div style={{ textAlign: "right" }}>
              <a href={articleUrl} download>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReaderPage;