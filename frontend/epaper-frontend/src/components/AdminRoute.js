import { Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    API.get("/auth/me")
      .then(() => setAllowed(true))
      .catch(() => {
        if (!toastShownRef.current) {
          toast.error("Please login to continue");
          toastShownRef.current = true;
        }
        setAllowed(false);
      });
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        await API.get("/auth/me");
      } catch {
        toast.error("Your session was terminated by an administrator");
        window.location.href = "/admin/login";
      }
    };

    const id = setInterval(check, 15_000); // every 15s
    return () => clearInterval(id);
  }, []);

  if (allowed === null) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking session…
      </div>
    );
  }

  return allowed ? children : <Navigate to="/admin/login" replace />;
}

export default AdminRoute;