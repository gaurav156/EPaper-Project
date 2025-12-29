import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true
});

// ONLY for forced logout detection
API.interceptors.response.use(
  res => res,
  err => {
    if (
      err.response?.status === 401 &&
      err.response?.data?.reason === "SESSION_REVOKED"
    ) {
      toast.error("Your session was terminated by an administrator");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export const logout = async () => {
  try {
    await API.post("/auth/logout");
  } finally {
    window.location.href = "/admin/login";
  }
};

export default API;