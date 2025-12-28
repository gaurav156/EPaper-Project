import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // ⬅️ IMPORTANT: prevents Enter/Tab mishaps

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      navigate("/admin", { replace: true });
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setError("Invalid email or password");
      } else if (status === 429) {
        setError("Too many login attempts. Please wait.");
      } else {
        setError("Login failed. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          padding: 24,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Admin Login</h2>

        <label>Email</label>
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: "#d32f2f", marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 12,
  borderRadius: 4,
  border: "1px solid #ccc"
};

export default AdminLogin;