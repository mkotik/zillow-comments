import axios from "axios";
import { getBaseUrl } from "../helpers";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  },
  setAccessToken(token) {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
  },
  clearAll() {
    this.clearAccessToken();
    this.clearUser();
  },
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // needed for cross-site refresh cookie
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/google",
  "/auth/logout",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    // Never retry refresh itself (avoid loops)
    const url = String(original.url || "");

    // Don't try refresh for auth endpoints (keeps real auth errors visible)
    if (NO_REFRESH_PATHS.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    if (url.includes("/auth/refresh")) {
      authStorage.clearAll();
      return Promise.reject(error);
    }

    if (original._retry) {
      authStorage.clearAll();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        api
          .post("/auth/refresh")
          .then((res) => {
            const { accessToken, user } = res.data || {};
            if (accessToken) authStorage.setAccessToken(accessToken);
            if (user) authStorage.setUser(user);
            return accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });

      await refreshPromise;
      return api(original);
    } catch (refreshErr) {
      authStorage.clearAll();
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
