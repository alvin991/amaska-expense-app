import axios from 'axios';

// Attach JWT from localStorage (if present) to every axios request
axios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Global response interceptor: handle 401s (expired/invalid token)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      // Clear any stored auth state
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      // Build the login URL using Vite's base path, e.g. '/amaska-app/'
      const base = import.meta.env.BASE_URL || '/';
      const loginPath = `${base.replace(/\/+$/, '/') }login`;

      // Avoid infinite loop if already on login
      if (!window.location.pathname.startsWith(loginPath)) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);
