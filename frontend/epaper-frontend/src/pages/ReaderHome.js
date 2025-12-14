import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderHome() {
  const [editions, setEditions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/editions").then((res) => setEditions(res.data));
  }, []);

  return (
    <div>
      <h2>Select Newspaper Date</h2>

      {editions.map((edition) => (
        <div
          key={edition._id}
          style={{
            padding: 10,
            borderBottom: "1px solid #ddd",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/read/${edition.editionDate}`)}
        >
          <strong>{edition.editionDate}</strong> — {edition.newspaperName}
        </div>
      ))}
    </div>
  );
}

export default ReaderHome;