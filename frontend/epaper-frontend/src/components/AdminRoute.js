import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setAllowed(true))
      .catch(() => {
        toast.error("Session expired. Please login again.");
        setAllowed(false);
      });
  }, []);

  if (allowed === null) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking session…
      </div>
    );
  }

  return allowed
    ? children
    : <Navigate to="/admin/login" replace />;
}

export default AdminRoute;