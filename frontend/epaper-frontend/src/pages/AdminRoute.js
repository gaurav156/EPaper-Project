import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";

function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;