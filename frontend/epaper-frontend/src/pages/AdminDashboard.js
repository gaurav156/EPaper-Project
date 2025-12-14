import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const [editions, setEditions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/editions").then((res) => setEditions(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {editions.map((edition) => (
        <div
          key={edition._id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10
          }}
        >
          <h3>{edition.newspaperName}</h3>
          <p>Date: {edition.editionDate}</p>
          <p>Pages: {edition.pageCount}</p>

          <button
            onClick={() =>
              navigate(`/admin/edition/${edition._id}`)
            }
          >
            Manage Pages
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;