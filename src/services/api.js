import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { store } from '../store';
import { setCredentials, clearCredentials } from '../features/auth/store/authSlice';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        store.dispatch(clearCredentials());
        isRefreshing = false;
        return Promise.reject(error);
      }

      if (refreshToken === 'mock_sandbox_refresh_token_jwt') {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const data = res.data.result;
        const accessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        const userSummary = data.user;

        store.dispatch(
          setCredentials({
            accessToken,
            user: userSummary,
          })
        );

        if (newRefreshToken) {
          localStorage.setItem('admin_refresh_token', newRefreshToken);
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(clearCredentials());
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
