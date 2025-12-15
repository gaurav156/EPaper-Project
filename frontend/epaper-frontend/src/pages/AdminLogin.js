import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
        return alert("Email and password are required");
    }
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin");
    } catch {
      alert("Invalid credentials");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        navigate("/admin");
    }
  }, [navigate]);

  return (
    <div>
      <h2>Admin Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}

export default AdminLogin;