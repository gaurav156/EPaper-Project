import axios from "axios";

const API = axios.create({
  baseURL: process.env.BACKEND_API_BASE_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry
    ) {
      original._retry = true;

      try {
        const res = await API.post("/auth/refresh", {
          refreshToken: localStorage.getItem("refreshToken")
        });

        localStorage.setItem("accessToken", res.data.accessToken);
        original.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return API(original);
      } catch {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/admin/login";
}

export default API;