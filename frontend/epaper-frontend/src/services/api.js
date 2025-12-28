import axios from "axios";

const API = axios.create({
  baseURL: process.env.BACKEND_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true
});

export const logout = async () => {
  try {
    await API.post("/auth/logout");
  } finally {
    window.location.href = "/admin/login";
  }
};

export default API;