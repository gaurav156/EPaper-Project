import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload", formData);
      alert("Upload successful");
      navigate(`/viewer?key=${res.data.key}`);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload Newspaper</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;