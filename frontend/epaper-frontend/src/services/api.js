import axios from "axios";

const API = axios.create({
  baseURL: process.env.BACKEND_API_BASE_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;