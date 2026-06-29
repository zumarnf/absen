import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Auth is carried by an httpOnly cookie; send it with every request.
  withCredentials: true,
});

// Read a non-httpOnly cookie value by name (browser only).
const readCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=") || undefined;
};

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

// Request interceptor - attach the CSRF token (double-submit cookie) on every
// state-changing request so it matches the server-set `csrf-token` cookie.
axiosInstance.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (MUTATING_METHODS.has(method)) {
    const token = readCookie("csrf-token");
    if (token) {
      config.headers.set("X-CSRF-Token", token);
    }
  }
  return config;
});

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // The auth cookie is httpOnly (cannot be cleared from JS) and is already
      // invalid/expired here; just drop the persisted client state and bounce.
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
