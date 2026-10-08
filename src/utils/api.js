import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.rayhanrwa.my.id/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Global response interceptor:
 * - 401 Unauthorized  → token expired / invalid → logout & redirect to /login
 * - 403 Forbidden     → token valid but no permission → same treatment
 */
const handleAuthError = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  // Use replace so user can't press "Back" to a protected page
  window.location.replace('/login');
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        handleAuthError();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
