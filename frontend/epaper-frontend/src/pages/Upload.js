import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);
  const [editionDate, setEditionDate] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      return alert("Select a file");
    }

    if (file.type !== "application/pdf") {
      return alert("Only PDF files allowed");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("editionDate", editionDate);

    try {
      const res = await API.post("/upload", formData);
      alert("Upload successful");
      navigate(`/admin/viewer?key=${res.data.key}`);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.status === 401
          ? "Unauthorized - please login again"
          : "Upload failed"
      );
    }
  };

  return (
    <div>
      <h2>Upload Newspaper</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="date"
        onChange={e => setEditionDate(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;