import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminEdition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edition, setEdition] = useState(null);

  useEffect(() => {
    API.get(`/editions/${id}`).then((res) => setEdition(res.data));
  }, [id]);

  if (!edition) return <p>Loading...</p>;

  return (
    <div>
      <h2>{edition.newspaperName}</h2>
      <p>Date: {edition.editionDate}</p>

      {[...Array(edition.pageCount)].map((_, i) => (
        <button
          key={i}
          onClick={() =>
            navigate(
              `/admin/mask/${edition._id}/page/${i + 1}`
            )
          }
        >
          Page {i + 1}
        </button>
      ))}
    </div>
  );
}

export default AdminEdition;