import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReaderHome() {
  const [editions, setEditions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/editions").then((res) => {
      const uniqueDates = Array.from(
      new Set(res.data.map(e => e.editionDate))
    ).map(date => ({
      editionDate: date
    }));

    setEditions(uniqueDates);
    });
  }, []);

  return (
    <div>
      <h2>Select Newspaper Date</h2>

      {editions.map((edition) => (
        <div
          key={edition.editionDate}
          style={{
            padding: 10,
            borderBottom: "1px solid #ddd",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/read/${edition.editionDate}`)}
        >
          <strong>{edition.editionDate}</strong>
        </div>
      ))}
    </div>
  );
}

export default ReaderHome;