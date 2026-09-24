import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1", withCredentials: true });
let refreshPromise = null;
api.interceptors.response.use((response) => response, async (error) => {
  const config = error.config;
  const url = config?.url || "";
  if (error.response?.status !== 401 || !config || config._retried || /users\/(login|register|refresh-token)/.test(url)) return Promise.reject(error);
  config._retried = true;
  try {
    refreshPromise ||= api.post("/users/refresh-token").finally(() => { refreshPromise = null; });
    await refreshPromise;
    return api(config);
  } catch (refreshError) {
    window.dispatchEvent(new Event("vidtube:unauthorized"));
    return Promise.reject(refreshError);
  }
});
export default api;
