import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [file, setFile] = useState(null);
  const [editionDate, setEditionDate] = useState(null);
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [editionType, setEditionType] = useState("REGULAR");
  const [category, setCategory] = useState("");

  const handleUpload = async () => {
    if (!file) {
      return alert("Select a file");
    }

    if (file.type !== "application/pdf") {
      return alert("Only PDF files allowed");
    }

    if (!editionDate) {
      return alert("Please select edition date");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("editionDate", editionDate);
    formData.append("city", city);
    formData.append("editionType", editionType);
    formData.append("category", category);

    try {
      const res = await API.post("/upload", formData);
      alert("Upload successful");
      navigate(`/admin/edition/${res.data.edition._id}`);
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
      <select onChange={e => setEditionType(e.target.value)}>
        <option value="REGULAR">Regular</option>
        <option value="SPECIAL">Special</option>
      </select>
      <input
        placeholder="City (Mumbai, Pune...)"
        onChange={e => setCity(e.target.value)}
      />
      <input
        placeholder="Category (Sports, Economy...)"
        onChange={e => setCategory(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default Upload;