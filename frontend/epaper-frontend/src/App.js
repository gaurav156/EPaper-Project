import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>E-Paper Project</h1>
      <p>Backend says:</p>
      <b>{message}</b>
    </div>
  );
}

export default App;